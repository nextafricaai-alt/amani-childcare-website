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
  "Zara", "Amani", "Faraji", "Imani", "Bakari", "Kamau", "Makena", "Tendo", "Kato", "Babirye",
  "Ethan", "Nyah", "Sora", "Kai", "Maya", "Léo", "Chloe", "Mateo", "Kira", "Tariq",
  "Sam", "Joy", "Grace", "Faith", "Blessing", "Divine", "Prince", "Glory", "Peace", "Hope",
  "David", "Sarah", "Joshua", "Hannah", "Caleb", "Esther", "Samuel", "Ruth", "Isaac", "Naomi",
  "Kinsley", "Wyatt", "Silas", "Cora", "Waylon", "Maverick", "Piper", "Atlas", "Hazel", "Felix"
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
    const totalNames = 45; // Well-spaced spread across viewport

    const fontFamilies = [
      "'Patrick Hand', cursive, sans-serif",
      "'Fredoka', cursive, sans-serif",
      "'Nunito', sans-serif"
    ];

    // Increased opacity (18% - 25%) so names are clearly visible yet tastefully soft & faded
    const colors = [
      "rgba(22, 53, 42, 0.22)",     // Pikadon Forest Green (soft visible)
      "rgba(184, 147, 74, 0.26)",    // Warm Honey Gold
      "rgba(61, 107, 87, 0.22)",     // Warm Sage
      "rgba(40, 37, 29, 0.18)",      // Soft Ink
    ];

    for (let i = 0; i < totalNames; i++) {
      const name = KIDS_NAMES[i % KIDS_NAMES.length];
      const row = Math.floor(i / 5);
      const col = i % 5;
      const baseLeft = (col * 20) + (Math.sin(i * 3.7) * 7 + 4);
      const baseTop = (row * 11) + (Math.cos(i * 2.3) * 4 + 3);

      items.push({
        id: i,
        name,
        left: Math.max(3, Math.min(90, baseLeft)),
        top: Math.max(2, Math.min(94, baseTop)),
        fontSize: 1.35 + (i % 4) * 0.45, // 1.35rem to 2.7rem for clear legibility
        rotation: (i % 7) * 4.5 - 12,    // -12deg to +12deg tilt
        fontFamily: fontFamilies[i % fontFamilies.length],
        color: colors[i % colors.length],
      });
    }

    return items;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0 mix-blend-multiply opacity-80"
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
          }}
        >
          {item.name}
        </span>
      ))}
    </div>
  );
}
