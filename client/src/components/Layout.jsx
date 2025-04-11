import React from "react";
import { Outlet } from "react-router-dom";
import FooterTabs from "./TabsComponent"; // adjust if in a different folder

const Layout = () => {
  return (
    <>
      <div style={{ paddingBottom: '70px' }}>
        <Outlet />
      </div>
      <FooterTabs />
    </>
  );
};

export default Layout;
