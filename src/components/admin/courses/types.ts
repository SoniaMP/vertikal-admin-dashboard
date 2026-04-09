export type CourseStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export type CourseRow = {
  id: string;
  title: string;
  slug: string;
  courseDate: Date;
  status: string;
  maxCapacity: number;
  courseType: { id: string; name: string };
  instructor?: { id: string; name: string } | null;
  prices: { id: string; name: string; amountCents: number }[];
  _count: { registrations: number };
};

export type CourseTypeOption = {
  id: string;
  name: string;
};
