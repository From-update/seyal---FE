'use client';

import React from 'react';

interface SeyalLogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  showIconOnly?: boolean;
}

export function SeyalLogo({
  theme = 'light',
  size = 'md',
  className = '',
  showText = true,
  showIconOnly = false,
}: SeyalLogoProps) {
  const isDark = theme === 'dark';
  const shouldShowText = showText && !showIconOnly;

  const sizeConfig = {
    sm: { icon: 'w-7 h-7 rounded-lg text-sm', check: 'w-4 h-4', bar: 'h-6', tamil: 'text-base', english: 'text-[9px] tracking-[0.2em]' },
    md: { icon: 'w-9 h-9 rounded-xl text-base', check: 'w-5 h-5', bar: 'h-8', tamil: 'text-xl', english: 'text-[11px] tracking-[0.22em]' },
    lg: { icon: 'w-11 h-11 rounded-2xl text-lg', check: 'w-6 h-6', bar: 'h-10', tamil: 'text-2xl', english: 'text-[13px] tracking-[0.25em]' },
    xl: { icon: 'w-14 h-14 rounded-2xl text-2xl', check: 'w-8 h-8', bar: 'h-12', tamil: 'text-3xl', english: 'text-[15px] tracking-[0.3em]' },
  }[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Icon */}
      <div
        className={`${sizeConfig.icon} flex items-center justify-center bg-gradient-to-br from-[#119875] to-[#08745B] text-white shadow-sm flex-shrink-0`}
        style={{
          boxShadow: isDark
            ? '0 4px 14px rgba(17, 152, 117, 0.35)'
            : '0 4px 12px rgba(8, 116, 91, 0.2)',
        }}
      >
        <svg
          className={`${sizeConfig.check}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {shouldShowText && (
        <>
          {/* Vertical Divider */}
          <div
            className={`w-[2px] ${sizeConfig.bar} rounded-full transition-colors`}
            style={{ backgroundColor: isDark ? '#119875' : '#08745B' }}
          />

          {/* Typography */}
          <div className="flex flex-col justify-center leading-none">
            <span
              className={`font-bold font-sans ${sizeConfig.tamil} tracking-wide transition-colors`}
              style={{ color: isDark ? '#FFFFFF' : '#14251F' }}
            >
              செயல்
            </span>
            <span
              className={`font-extrabold uppercase mt-1 ${sizeConfig.english} transition-colors`}
              style={{ color: isDark ? '#A7F3D0' : '#08745B' }}
            >
              SEYAL
            </span>
          </div>
        </>
      )}
    </div>
  );
}
