"use client";

function ClientLayoutContent({ children }) {
  return (
    <>
      {children}
    </>
  );
}

export function ClientLayout({ children }) {
  return (
    <ClientLayoutContent>
      {children}
    </ClientLayoutContent>
  );
}
