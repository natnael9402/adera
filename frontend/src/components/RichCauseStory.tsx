'use client';

import React from 'react';
import { CheckCircle2, Target, Wrench, ShieldCheck, Heart } from 'lucide-react';

interface RichCauseStoryProps {
  content: string;
  className?: string;
}

export default function RichCauseStory({ content, className = '' }: RichCauseStoryProps) {
  if (!content) return null;

  // Split content by double newlines or single newlines
  const rawParagraphs = content.split(/\n\s*\n/);

  const renderFormattedInline = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, i) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return (
          <strong key={i} className="font-black text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-5 text-slate-600 leading-relaxed text-sm sm:text-base ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a heading (starts with #, ##, ### or emojis like 🎯, 🛠️, 💫, 📊)
        if (
          trimmed.startsWith('#') || 
          trimmed.startsWith('🎯') || 
          trimmed.startsWith('🛠️') || 
          trimmed.startsWith('💫') || 
          trimmed.startsWith('📊') ||
          trimmed.startsWith('Phase ')
        ) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={pIdx} className="pt-3 pb-1 border-b border-slate-100 first:pt-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                {renderFormattedInline(headingText)}
              </h3>
            </div>
          );
        }

        // Check if it's a list of bullets
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => {
          const l = line.trim();
          return l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || /^\d+\./.test(l);
        });

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-2.5 my-3 pl-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{renderFormattedInline(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph
        return (
          <p key={pIdx} className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
