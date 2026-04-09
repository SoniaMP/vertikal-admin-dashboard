"use client";

import { Button } from "@/components/ui/button";
import { CoursePersonalFields } from "./course-personal-fields";
import { CourseLicenseUpload } from "./course-license-upload";
import { CoursePriceSelector } from "./course-price-selector";

type PriceTier = {
  id: string;
  name: string;
  amountCents: number;
};

type Props = {
  prices: PriceTier[];
  onNext: () => void;
};

export function CourseRegistrationStep({ prices, onNext }: Props) {
  return (
    <div className="space-y-6">
      <CoursePersonalFields />
      <CourseLicenseUpload />
      <CoursePriceSelector prices={prices} />

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
