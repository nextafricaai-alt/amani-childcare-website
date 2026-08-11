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
  opacity: number;  // opacity
  rotation: number; // deg
  fontFamily: string;
  color: string;
}

export default function FadedKidsNamesBackground() {
  // Generate random positions, sizes, and font styles for names to fill the background floating texture
  const namesList = useMemo(() => {
    const items: FloatingName[] = [];
    const totalNames = 65; // High density spread across body

    const fontFamilies = [
      "var(--font-handwriting), 'Patrick Hand', cursive",
      "var(--font-heading), 'Fredoka', cursive",
      "var(--font-body), 'Nunito', sans-serif"
    ];

    const colors = [
      "rgba(22, 53, 42, 0.045)",     // Deep forest green super faint
      "rgba(184, 147, 74, 0.055)",    // Gold faint
      "rgba(61, 107, 87, 0.05)",     // Sage faint
      "rgba(40, 37, 29, 0.035)",      // Ink faint
    ];

    for (let i = 0; i < totalNames; i++) {
      const name = KIDS_NAMES[i % KIDS_NAMES.length];
      // Grid-seeded jitter position to avoid clumping while looking organic
      const row = Math.floor(i / 5);
      const col = i % 5;
      const baseLeft = (col * 20) + (Math.sin(i * 3) * 6 + 6);
      const baseTop = (row * 7.5) + (Math.cos(i * 2) * 2.5 + 2);

      items.push({
        id: i,
        name,
        left: Math.max(2, Math.min(92, baseLeft)),
        top: baseTop,
        fontSize: 1.1 + (i % 4) * 0.45, // 1.1rem to 2.45rem
        opacity: 0.5 + (i % 3) * 0.25,
        rotation: (i % 7) * 4 - 12, // -12deg to +12deg
        fontFamily: fontFamilies[i % fontFamilies.length],
        color: colors[i % colors.length],
      });
    }

    return items;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      style={{ minHeight: "100%" }}
    >
      {namesList.map((item) => (
        <span
          key={item.id}
          className="absolute whitespace-nowrap font-medium transition-opacity duration-1000"
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
