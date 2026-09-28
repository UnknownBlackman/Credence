"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROFILES = exports.PROFILE_C = exports.PROFILE_B = exports.PROFILE_A = exports.verifyAttestationSignature = exports.generateZkAttestation = void 0;
/**
 * index.ts - Public API for the zkTLS Attestation Engine
 */
var attestation_1 = require("./attestation");
Object.defineProperty(exports, "generateZkAttestation", { enumerable: true, get: function () { return attestation_1.generateZkAttestation; } });
Object.defineProperty(exports, "verifyAttestationSignature", { enumerable: true, get: function () { return attestation_1.verifyAttestationSignature; } });
var mockData_1 = require("./mockData");
Object.defineProperty(exports, "PROFILE_A", { enumerable: true, get: function () { return mockData_1.PROFILE_A; } });
Object.defineProperty(exports, "PROFILE_B", { enumerable: true, get: function () { return mockData_1.PROFILE_B; } });
Object.defineProperty(exports, "PROFILE_C", { enumerable: true, get: function () { return mockData_1.PROFILE_C; } });
Object.defineProperty(exports, "ALL_PROFILES", { enumerable: true, get: function () { return mockData_1.ALL_PROFILES; } });
//# sourceMappingURL=index.js.map