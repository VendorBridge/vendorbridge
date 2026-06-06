"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { defaultLineItem, type RfqFormValues } from "@/lib/rfq-schema";

export function LineItemsTable() {
  const { control, register, formState } = useFormContext<RfqFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const lineItemsError = formState.errors.lineItems?.message
    ?? formState.errors.lineItems?.root?.message;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
        <div>
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Line Items
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Add the products or services you need quotes for
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append(defaultLineItem())}
          className="gap-1.5 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] rounded-lg"
        >
          <Plus className="size-3.5" />
          Add line item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
              <th className="text-left py-3 px-5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[32%]">
                Item Name *
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[14%]">
                Quantity *
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[14%]">
                Unit
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[18%]">
                Est. Unit Price
              </th>
              <th className="py-3 px-3 w-[6%]" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const itemError = formState.errors.lineItems?.[index];
              return (
                <tr
                  key={field.id}
                  className={cn(
                    "border-b border-[hsl(var(--border))]/50 last:border-0",
                    "hover:bg-[hsl(var(--accent))]/30 transition-colors group"
                  )}
                >
                  <td className="py-3 px-5 align-top">
                    <Input
                      {...register(`lineItems.${index}.itemName`)}
                      placeholder="Item name..."
                      className={cn(
                        "rounded-lg",
                        itemError?.itemName && "border-red-500"
                      )}
                    />
                    {itemError?.itemName && (
                      <p className="text-xs text-red-500 mt-1">
                        {itemError.itemName.message}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 align-top">
                    <Input
                      type="number"
                      step="0.001"
                      min={0.001}
                      {...register(`lineItems.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      className={cn(
                        "text-center rounded-lg",
                        itemError?.quantity && "border-red-500"
                      )}
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <Input
                      {...register(`lineItems.${index}.unit`)}
                      placeholder="pcs"
                      className="text-center rounded-lg"
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register(`lineItems.${index}.estimatedUnitPrice`, {
                        setValueAs: (v) =>
                          v === "" || v === null ? undefined : parseFloat(v),
                      })}
                      placeholder="Optional"
                      className="text-center rounded-lg"
                    />
                  </td>
                  <td className="py-3 px-3 text-center align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        "text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10",
                        "disabled:opacity-30 disabled:pointer-events-none"
                      )}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {lineItemsError && (
        <p className="px-6 py-3 text-xs text-red-500 border-t border-[hsl(var(--border))]">
          {String(lineItemsError)}
        </p>
      )}
    </div>
  );
}
