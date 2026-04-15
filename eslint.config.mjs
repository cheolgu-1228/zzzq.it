import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React 19 신규 규칙 — useEffect 안에서 setState 호출 금지.
      // 이 프로젝트에서는 localStorage 하이드레이션, prop 변경 시 내부 state 리셋,
      // 초기 라운드 생성 등 "effect 내부 setState 가 정당한" 패턴이 많아 끈다.
      // 정말로 필요하면 개별 파일에 // eslint-disable-next-line 을 달아서 해결하되,
      // 지금 수준에서는 전역 off 가 합리적.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
