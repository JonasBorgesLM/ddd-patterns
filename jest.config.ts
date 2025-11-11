export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.(t|j)sx?$": ["@swc/jest"],
  },
  transformIgnorePatterns: ["node_modules/(?!(jstoxml)/)"],
  coverageProvider: "v8",
  clearMocks: true,
};
