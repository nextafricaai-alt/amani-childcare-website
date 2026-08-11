"use client";

import React, { useMemo } from "react";

// A rich, diverse collection of children's names
const KIDS_NAMES = [
  "Liam", "Olivia", "Noah", "Emma", "Oliver", "Amelia", "Elijah", "Ava", "Henry", "Sophia",
  "Lucas", "Isabella", "Benjamin", "Mia", "Theodore", "Evelyn", "Mateo", "Harper", "Levi", "Luna",
  "Sebastian", "Camila", "Daniel", "Gianna", "Jack", "Elizabeth", "Alexander", "Eleanor", "Owen", "Ella",
  "Asher", "Abigail", "Michael", "Sophia", "Ethan", "Avery", "Leo", "Scarlett", "Jackson", "Emily",
  "Mason", "Aria", "Ezra", "Penelope", "John", "Chloe", "Hudson", "Layla", "Luca", "Mila",
  "Aidan", "Zuri", "Kian", "Amara", "Tariq", "Jabari", "Nia", "Kwame", "Zola", "Sekou",
  "Zara", "Amani", "Faraji", "Imani", "Bakari", "Kamau", "Makena", "Tendo", "Kato", "Babirye"
];

interface FloatingName {
  id: number;
  name: string;
  left: number; // 0-100%
  top: number;  // 0-100%
  fontSize: number; // rem
  rotation: number; // deg
  fontFamily: string;
  color: string;
}

export default function FadedKidsNamesBackground() {
  const namesList = useMemo(() => {
    const items: FloatingName[] = [];
    const totalNames = 36; // Perfectly distributed floaters across the viewport

    const fontFamilies = [
      "'Patrick Hand', cursive, sans-serif",
      "'Fredoka', cursive, sans-serif",
      "'Nunito', sans-serif"
    ];

    // Colors engineered to look rich & legible over both dark and light sections
    const colors = [
      "rgba(229, 169, 60, 0.38)",   // Warm Honey Gold
      "rgba(240, 235, 220, 0.32)",  // Soft Cream Ivory
      "rgba(61, 107, 87, 0.35)",    // Warm Sage
      "rgba(34, 72, 59, 0.30)",     // Pikadon Forest Green
    ];

    for (let i = 0; i < totalNames; i++) {
      const name = KIDS_NAMES[i % KIDS_NAMES.length];
      const row = Math.floor(i / 4);
      const col = i % 4;
      const baseLeft = (col * 24) + (Math.sin(i * 3.7) * 8 + 4);
      const baseTop = (row * 10) + (Math.cos(i * 2.3) * 3.5 + 3);

      items.push({
        id: i,
        name,
        left: Math.max(4, Math.min(88, baseLeft)),
        top: Math.max(3, Math.min(92, baseTop)),
        fontSize: 1.4 + (i % 4) * 0.4, // 1.4rem to 2.6rem
        rotation: (i % 7) * 4.5 - 12,  // -12deg to +12deg tilt
        fontFamily: fontFamilies[i % fontFamilies.length],
        color: colors[i % colors.length],
      });
    }

    return items;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-20 opacity-90"
    >
      {namesList.map((item) => (
        <span
          key={item.id}
          className="absolute whitespace-nowrap font-semibold tracking-wide"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.fontSize}rem`,
            fontFamily: item.fontFamily,
            color: item.color,
            transform: `rotate(${item.rotation}deg)`,
            userSelect: "none",
            textShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          {item.name}
        </span>
      ))}
    </div>
  );
}
