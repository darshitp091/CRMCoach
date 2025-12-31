'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Currency, currencies } from '@/config/pricing';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencySelectorProps {
  selected: Currency;
  onSelect: (currency: Currency) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCurrency = currencies[selected];
  const currencyList = Object.values(currencies);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-brand-primary-300 transition-colors"
      >
        <span className="text-lg">{selectedCurrency.flag}</span>
        <span className="font-medium text-gray-900">{selectedCurrency.code}</span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Select Currency
              </div>
              {currencyList.map((currency) => {
                const isSelected = currency.code === selected;
                return (
                  <button
                    key={currency.code}
                    onClick={() => {
                      onSelect(currency.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-brand-primary-50 text-brand-primary-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{currency.flag}</span>
                      <div className="text-left">
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-brand-primary-600" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
              <p className="text-xs text-gray-600">
                Prices are converted at current exchange rates. Final amount charged in {selectedCurrency.name}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
