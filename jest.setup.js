// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from "jest-mock-extended";

const prismaMock = mockDeep();
jest.mock("@/lib/db", () => ({
  __esModule: true,
  db: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});
