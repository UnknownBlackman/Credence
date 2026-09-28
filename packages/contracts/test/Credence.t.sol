// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/CredoVault.sol";
import "../src/CredoCreditManager.sol";
import "../src/MPPStreamingRepayer.sol";

contract CredenceTest is Test {
    MockUSDC public usdc;
    CredoVault public vault;
    CredoCreditManager public creditManager;
    MPPStreamingRepayer public mppRepayer;

    uint256 internal oraclePrivateKey = 0xA11CE;
    address internal notaryOracle;

    address internal deployer = address(0xDDEE);
    address internal borrower = address(0xBB01);
    address internal lender = address(0x1111);
    address internal attacker = address(0xDEAD);

    uint256 internal constant ONE_HOUR = 3600;
    uint256 internal constant ONE_DAY = 86400;

    function setUp() public {
        vm.warp(1_700_000_000);
        notaryOracle = vm.addr(oraclePrivateKey);

        vm.startPrank(deployer);

        // 1. Deploy MockUSDC
        usdc = new MockUSDC();

        // 2. Deploy CredoVault
        vault = new CredoVault(address(usdc));

        // 3. Deploy CredoCreditManager
        creditManager = new CredoCreditManager(address(vault), notaryOracle);

        // 4. Deploy MPPStreamingRepayer
        mppRepayer = new MPPStreamingRepayer(
            address(usdc),
            address(creditManager),
            address(vault)
        );

        // 5. Authorize creditManager and mppRepayer on vault
        vault.setCreditManager(address(creditManager));
        vault.setMPPRepayer(address(mppRepayer));

        // 6. Seed vault with 500,000 USDC
        uint256 seedAmount = 500_000 * 10 ** 6;
        usdc.approve(address(vault), seedAmount);
        vault.deposit(seedAmount, deployer);

        // 7. Fund borrower with 100,000 USDC for testing repayments
        usdc.mint(borrower, 100_000 * 10 ** 6);

        vm.stopPrank();
    }

    // ── Helper to build and sign UnderwritingAttestation ───────────────────────

    function _buildAttestation(
        uint256 trailing90dRevenue,
        uint256 disputeRateBps,
        uint256 invoiceFaceValue,
        uint256 dueInDays,
        string memory salt,
        int256 timestampOffset,
        uint256 signerKey
    ) internal view returns (CredoCreditManager.UnderwritingAttestation memory attestation) {
        attestation.businessIdHash = keccak256(bytes("acme_corp_entity_id"));
        attestation.invoiceHash = keccak256(bytes(string.concat("invoice_", salt)));
        attestation.invoiceDueDate = uint64(block.timestamp + dueInDays * ONE_DAY);
        attestation.timestamp = timestampOffset >= 0
            ? block.timestamp + uint256(timestampOffset)
            : block.timestamp - uint256(-timestampOffset);
        attestation.trailing90dRevenue = trailing90dRevenue;
        attestation.disputeRateBps = disputeRateBps;
        attestation.invoiceFaceValue = invoiceFaceValue;

        bytes32 structHash = keccak256(
            abi.encode(
                creditManager.ATTESTATION_TYPEHASH(),
                attestation.businessIdHash,
                trailing90dRevenue,
                disputeRateBps,
                invoiceFaceValue,
                attestation.invoiceDueDate,
                attestation.invoiceHash,
                attestation.timestamp
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", creditManager.domainSeparator(), structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        attestation.signature = abi.encodePacked(r, s, v);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MockUSDC Tests
    // ══════════════════════════════════════════════════════════════════════════

    function test_MockUSDC_Metadata() public view {
        assertEq(usdc.name(), "USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
    }

    function test_MockUSDC_InitialSupply() public view {
        assertGe(usdc.balanceOf(deployer), 9_000_000 * 10 ** 6);
    }

    function test_MockUSDC_FaucetDispenses() public {
        uint256 beforeBal = usdc.balanceOf(attacker);
        vm.prank(attacker);
        usdc.faucet();
        uint256 afterBal = usdc.balanceOf(attacker);
        assertEq(afterBal - beforeBal, 1_000 * 10 ** 6);
    }

    function test_MockUSDC_FaucetCooldownReverts() public {
        vm.startPrank(attacker);
        usdc.faucet();
        vm.expectRevert("MockUSDC: cooldown active");
        usdc.faucet();
        vm.stopPrank();
    }

    function test_MockUSDC_FaucetAfterCooldown() public {
        vm.startPrank(attacker);
        usdc.faucet();
        vm.warp(block.timestamp + ONE_DAY + 1);
        usdc.faucet();
        vm.stopPrank();
        assertEq(usdc.balanceOf(attacker), 2_000 * 10 ** 6);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CredoVault Tests
    // ══════════════════════════════════════════════════════════════════════════

    function test_CredoVault_Deposit() public {
        uint256 depositAmount = 10_000 * 10 ** 6;
        vm.prank(deployer);
        usdc.mint(lender, depositAmount);

        vm.startPrank(lender);
        usdc.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, lender);
        vm.stopPrank();

        assertGt(shares, 0);
        assertEq(vault.balanceOf(lender), shares);
    }

    function test_CredoVault_RevertNonCreditManagerDrawdown() public {
        vm.prank(attacker);
        vm.expectRevert("CredoVault: caller is not CreditManager");
        vault.executeDrawdown(attacker, 100 * 10 ** 6);
    }

    function test_CredoVault_AvailableLiquidity() public view {
        assertEq(vault.availableLiquidity(), 500_000 * 10 ** 6);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CredoCreditManager — Approvals
    // ══════════════════════════════════════════════════════════════════════════

    function test_CreditManager_ApproveProfileA() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5, // 0.05%
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "profile_a",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        creditManager.verifyAndApproveCredit(att);

        (
            uint256 approvedLimit,
            uint256 drawnAmount,
            uint256 aprBps,
            bytes32 storedHash,
            ,
            ,
            bool active,
            address lineSource
        ) = creditManager.creditLines(borrower);

        assertTrue(active);
        assertEq(approvedLimit, 36_000 * 10 ** 6); // 80% of 45k
        assertEq(drawnAmount, 0);
        assertEq(aprBps, 800); // 800 + 5/10 = 800
        assertEq(storedHash, att.invoiceHash);
        assertEq(lineSource, address(vault)); // Default liquidity source
    }

    function test_CreditManager_ApproveProfileB() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 80_000 * 10 ** 6,
            disputeRateBps: 40, // 0.40%
            invoiceFaceValue: 25_000 * 10 ** 6,
            dueInDays: 45,
            salt: "profile_b",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        creditManager.verifyAndApproveCredit(att);

        (uint256 approvedLimit, , uint256 aprBps, , , , bool active, ) = creditManager.creditLines(borrower);
        assertTrue(active);
        assertEq(approvedLimit, 20_000 * 10 ** 6); // 80% of 25k
        assertEq(aprBps, 804); // 800 + 40/10 = 804 bps
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CredoCreditManager — Rejections
    // ══════════════════════════════════════════════════════════════════════════

    function test_CreditManager_RevertHighDisputeRate() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 30_000 * 10 ** 6,
            disputeRateBps: 280, // 2.80% > 100 bps
            invoiceFaceValue: 10_000 * 10 ** 6,
            dueInDays: 30,
            salt: "profile_c",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        vm.expectRevert("CreditManager: dispute rate too high");
        creditManager.verifyAndApproveCredit(att);
    }

    function test_CreditManager_RevertInsufficientRevenue() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 10_000 * 10 ** 6, // 1x invoice < 2x required
            disputeRateBps: 30,
            invoiceFaceValue: 10_000 * 10 ** 6,
            dueInDays: 30,
            salt: "insufficient_rev",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        vm.expectRevert("CreditManager: insufficient revenue coverage");
        creditManager.verifyAndApproveCredit(att);
    }

    function test_CreditManager_RevertExpiredAttestation() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "expired_test",
            timestampOffset: -int256(ONE_HOUR + 10),
            signerKey: oraclePrivateKey
        });

        vm.warp(block.timestamp + ONE_HOUR + 60);

        vm.prank(borrower);
        vm.expectRevert("CreditManager: attestation expired");
        creditManager.verifyAndApproveCredit(att);
    }

    function test_CreditManager_RevertInvalidSignature() public {
        uint256 attackerKey = 0xBADC0DE;
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "bad_sig",
            timestampOffset: 0,
            signerKey: attackerKey
        });

        vm.prank(borrower);
        vm.expectRevert("CreditManager: invalid notary signature");
        creditManager.verifyAndApproveCredit(att);
    }

    function test_CreditManager_RevertInvoiceHashReuse() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "reuse_test",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        creditManager.verifyAndApproveCredit(att);

        // Attempt reuse with attacker account
        CredoCreditManager.UnderwritingAttestation memory attReuse = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "reuse_test", // same salt -> same hash
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(attacker);
        vm.expectRevert("CreditManager: invoice already factored");
        creditManager.verifyAndApproveCredit(attReuse);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CredoCreditManager — Drawdowns
    // ══════════════════════════════════════════════════════════════════════════

    function test_Drawdown_Success() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "draw_test",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        creditManager.verifyAndApproveCredit(att);

        uint256 drawAmount = 20_000 * 10 ** 6;
        uint256 balBefore = usdc.balanceOf(borrower);

        vm.prank(borrower);
        creditManager.drawdown(drawAmount);

        uint256 balAfter = usdc.balanceOf(borrower);
        assertEq(balAfter - balBefore, drawAmount);
        assertEq(creditManager.remainingCredit(borrower), 16_000 * 10 ** 6);
    }

    function test_Drawdown_RevertExceedsLimit() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "overdraw_test",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.prank(borrower);
        creditManager.verifyAndApproveCredit(att);

        vm.prank(borrower);
        vm.expectRevert("CreditManager: exceeds credit limit");
        creditManager.drawdown(36_001 * 10 ** 6);
    }

    function test_Drawdown_RevertNoCreditLine() public {
        vm.prank(attacker);
        vm.expectRevert("CreditManager: no active credit line");
        creditManager.drawdown(100 * 10 ** 6);
    }

    function test_Drawdown_PartialDrawdowns() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "partial_draw",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(20_000 * 10 ** 6);
        creditManager.drawdown(16_000 * 10 ** 6);

        vm.expectRevert("CreditManager: exceeds credit limit");
        creditManager.drawdown(1);
        vm.stopPrank();

        assertEq(creditManager.remainingCredit(borrower), 0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MPPStreamingRepayer — Settlement
    // ══════════════════════════════════════════════════════════════════════════

    function test_MPP_FullSettlementWithSurplus() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "mpp_full",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(36_000 * 10 ** 6);
        vm.stopPrank();

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 * ONE_DAY);

        uint256 grossAmount = 45_000 * 10 ** 6;

        (uint256 toVault, uint256 toBorrower, uint256 interest, uint256 protocolFee) = mppRepayer.previewSettlement(borrower, grossAmount);
        assertGt(toVault, 36_000 * 10 ** 6);
        assertGt(toBorrower, 0);
        assertGt(interest, 0);
        assertGt(protocolFee, 0);
        assertEq(protocolFee, (interest * 50) / 10_000);
        assertEq(toVault + protocolFee + toBorrower, grossAmount);

        // Execute settlement
        vm.startPrank(borrower);
        usdc.approve(address(mppRepayer), grossAmount);
        mppRepayer.settleInvoicePayment(att.invoiceHash, grossAmount);
        vm.stopPrank();

        ( , , , , , bool settled) = mppRepayer.settlements(att.invoiceHash);
        assertTrue(settled);
    }

    function test_MPP_PartialPayment() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "mpp_partial",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(36_000 * 10 ** 6);

        uint256 partialAmount = 5_000 * 10 ** 6;
        usdc.approve(address(mppRepayer), partialAmount);
        mppRepayer.settleInvoicePayment(att.invoiceHash, partialAmount);
        vm.stopPrank();

        ( , , , , , bool settled) = mppRepayer.settlements(att.invoiceHash);
        assertFalse(settled); // Not fully settled yet
    }

    function test_MPP_RevertDoubleSettlement() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "mpp_double",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(36_000 * 10 ** 6);

        uint256 grossAmount = 45_000 * 10 ** 6;
        usdc.approve(address(mppRepayer), grossAmount * 2);
        mppRepayer.settleInvoicePayment(att.invoiceHash, grossAmount);

        vm.expectRevert("MPP: already settled");
        mppRepayer.settleInvoicePayment(att.invoiceHash, grossAmount);
        vm.stopPrank();
    }

    function test_MPP_RevertInvoiceHashMismatch() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "mpp_mismatch",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(10_000 * 10 ** 6);

        bytes32 wrongHash = keccak256(bytes("wrong_invoice_hash"));
        usdc.approve(address(mppRepayer), 10_000 * 10 ** 6);

        vm.expectRevert("MPP: invoice hash mismatch");
        mppRepayer.settleInvoicePayment(wrongHash, 10_000 * 10 ** 6);
        vm.stopPrank();
    }

    function test_MPP_ProtocolFeeOnInterest() public {
        CredoCreditManager.UnderwritingAttestation memory att = _buildAttestation({
            trailing90dRevenue: 150_000 * 10 ** 6,
            disputeRateBps: 5,
            invoiceFaceValue: 45_000 * 10 ** 6,
            dueInDays: 30,
            salt: "mpp_fee_test",
            timestampOffset: 0,
            signerKey: oraclePrivateKey
        });

        vm.startPrank(borrower);
        creditManager.verifyAndApproveCredit(att);
        creditManager.drawdown(36_000 * 10 ** 6);
        vm.stopPrank();

        // Advance 30 days
        vm.warp(block.timestamp + 30 * ONE_DAY);

        uint256 grossAmount = 45_000 * 10 ** 6;
        (
            uint256 toVault,
            uint256 toBorrower,
            uint256 interest,
            uint256 expectedFee
        ) = mppRepayer.previewSettlement(borrower, grossAmount);

        // Verify 50 bps on interest (0.5%)
        assertEq(expectedFee, (interest * 50) / 10_000);
        assertGt(expectedFee, 0);

        address recipient = mppRepayer.feeRecipient();
        uint256 feeRecipientBalBefore = usdc.balanceOf(recipient);
        uint256 vaultBalBefore = usdc.balanceOf(address(vault));

        // Settle payment
        vm.startPrank(borrower);
        usdc.approve(address(mppRepayer), grossAmount);
        mppRepayer.settleInvoicePayment(att.invoiceHash, grossAmount);
        vm.stopPrank();

        // Assert fee recipient received exact protocol fee
        uint256 feeRecipientBalAfter = usdc.balanceOf(recipient);
        assertEq(feeRecipientBalAfter - feeRecipientBalBefore, expectedFee);

        // Assert cumulative tracking
        assertEq(mppRepayer.totalProtocolFees(), expectedFee);
        assertEq(mppRepayer.protocolFees(att.invoiceHash), expectedFee);

        // Assert vault received principal + net interest (gross interest - protocol fee)
        uint256 vaultBalAfter = usdc.balanceOf(address(vault));
        assertEq(vaultBalAfter - vaultBalBefore, toVault);
        assertEq(toVault, 36_000 * 10 ** 6 + (interest - expectedFee));

        // Assert borrower received surplus
        ( , , , uint256 surplus, , bool settled) = mppRepayer.settlements(att.invoiceHash);
        assertTrue(settled);
        assertEq(surplus, toBorrower);
    }

    function test_MPP_SetFeeRecipient() public {
        address newTreasury = address(0x9999);
        assertEq(mppRepayer.feeRecipient(), deployer);

        vm.prank(deployer);
        mppRepayer.setFeeRecipient(newTreasury);
        assertEq(mppRepayer.feeRecipient(), newTreasury);
    }

    function test_MPP_RevertNonOwnerSetFeeRecipient() public {
        vm.prank(attacker);
        vm.expectRevert();
        mppRepayer.setFeeRecipient(address(0x9999));
    }

    function test_MPP_RevertZeroAddressFeeRecipient() public {
        vm.prank(deployer);
        vm.expectRevert("MPP: zero address");
        mppRepayer.setFeeRecipient(address(0));
    }
}
