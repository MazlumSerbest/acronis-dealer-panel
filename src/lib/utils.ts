import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFullNameInitials(fullName: string) {
  if (!fullName.trim()) {
      return "?";
  }
  const names = fullName.trim().split(" ");

  if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
  }

  const firstNameInitial = names[0].charAt(0).toUpperCase();
  const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();

  return `${firstNameInitial}${lastNameInitial}`;
}
