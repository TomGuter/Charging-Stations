"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
exports.default = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/tests/gemini.test.ts",
        "<rootDir>/src/services/geminiService.ts",
    ],
};
//# sourceMappingURL=jest.config.js.map