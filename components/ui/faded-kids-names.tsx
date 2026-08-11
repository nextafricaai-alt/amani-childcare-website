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
    const totalNames = 50;

    const fontFamilies = [
      "'Patrick Hand', cursive, sans-serif",
      "'Fredoka', cursive, sans-serif",
      "'Nunito', sans-serif"
    ];

    // Slightly higher contrast colors tailored against background surfaces
    const colors = [
      "rgba(22, 53, 42, 0.32)",     // Pikadon Forest Green (rich contrast)
      "rgba(165, 125, 45, 0.35)",    // Antique Amber Gold
      "rgba(40, 37, 29, 0.28)",      // Deep Charcoal Ink
      "rgba(45, 90, 70, 0.32)",      // Warm Sage Green
    ];

    let count = 0;
    for (let i = 0; count < 32 && i < 80; i++) {
      const name = KIDS_NAMES[i % KIDS_NAMES.length];
      const row = Math.floor(i / 5);
      const col = i % 5;
      const left = Math.max(3, Math.min(88, (col * 20) + (Math.sin(i * 3.7) * 6 + 4)));
      const top = Math.max(2, Math.min(94, (row * 9) + (Math.cos(i * 2.3) * 3 + 2)));

      // EXCLUDE THE CENTRAL 3D FLIPBOOK AREA (left 18%-82%, top 12%-88%) on the hero section
      const isOverFlipbook = left > 16 && left < 84 && top > 10 && top < 88;

      if (!isOverFlipbook) {
        items.push({
          id: count,
          name,
          left,
          top,
          fontSize: 1.85 + (count % 4) * 0.45, // Increased font size (1.85rem to 3.2rem)
          rotation: (count % 7) * 4.5 - 12,    // -12deg to +12deg tilt
          fontFamily: fontFamilies[count % fontFamilies.length],
          color: colors[count % colors.length],
        });
        count++;
      }
    }

    return items;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-20 opacity-95"
    >
      {namesList.map((item) => (
        <span
          key={item.id}
          className="absolute whitespace-nowrap font-bold tracking-wide"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.fontSize}rem`,
            fontFamily: item.fontFamily,
            color: item.color,
            transform: `rotate(${item.rotation}deg)`,
            userSelect: "none",
            textShadow: "0 1px 3px rgba(255,255,255,0.4)",
          }}
        >
          {item.name}
        </span>
      ))}
    </div>
  );
}
