import React from "react";
import "../index.css"; // make sure Tailwind + globals load
import V0Page from "../v0_design/app/page"; // importing v0.dev main page

export default function Home() {
  return (
    <div>
      <V0Page />
    </div>
  );
}
