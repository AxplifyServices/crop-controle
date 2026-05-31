'use client';

import {useMemo, useState} from 'react';
import {ChevronDown, X} from 'lucide-react';

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
  group?: string;
};

type MultiSelectDropdownProps = {
  label: string;
  placeholder: string;
  values: string[];
  options: MultiSelectOption[];
  onChange: (values: string[]) => void;
  emptyLabel: string;
  searchPlaceholder: string;
  selectedCountLabel: (count: number) => string;
};

export function MultiSelectDropdown({
  label,
  placeholder,
  values,
  options,
  onChange,
  emptyLabel,
  searchPlaceholder,
  selectedCountLabel
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values]
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return options;

    return options.filter((option) =>
      `${option.label} ${option.description || ''} ${option.group || ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [options, search]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, MultiSelectOption[]>();

    for (const option of filteredOptions) {
      const group = option.group || '';
      const currentOptions = groups.get(group) || [];

      currentOptions.push(option);
      groups.set(group, currentOptions);
    }

    return Array.from(groups.entries());
  }, [filteredOptions]);

  function toggleValue(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  }

  function removeValue(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className="relative">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none transition hover:bg-slate-50 focus:border-slate-400"
      >
        <span className="text-slate-500">
          {values.length > 0 ? selectedCountLabel(values.length) : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`text-slate-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {selectedOptions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white"
            >
              {option.label}

              <button
                type="button"
                onClick={() => removeValue(option.value)}
                className="rounded-full p-0.5 hover:bg-white/20"
                aria-label={`remove-${option.value}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="absolute z-30 mt-2 max-h-96 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500">
                {emptyLabel}
              </div>
            ) : (
              groupedOptions.map(([group, groupOptions]) => (
                <div key={group || 'default'} className="mb-2 last:mb-0">
                  {group ? (
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {group}
                    </div>
                  ) : null}

                  {groupOptions.map((option) => {
                    const checked = values.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleValue(option.value)}
                        className={`mb-1 flex w-full items-start justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                          checked
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>
                          <span className="block font-medium">
                            {option.label}
                          </span>

                          {option.description ? (
                            <span
                              className={`block text-xs ${
                                checked ? 'text-white/70' : 'text-slate-500'
                              }`}
                            >
                              {option.description}
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={`mt-0.5 h-4 w-4 rounded border ${
                            checked
                              ? 'border-white bg-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}