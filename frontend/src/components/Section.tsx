import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ title, children, className }: Props) {
  return (
    <section
      className={`bg-gray-800 rounded-2xl p-4 shadow ${className ?? ""}`}
    >
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
