import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCourseDate } from "./helpers";
import { formatPrice } from "@/helpers/price-calculator";
import { CourseStatusBadge } from "./course-status-badge";

type CourseDetail = {
  status: string;
  courseDate: Date;
  maxCapacity: number;
  courseType: { name: string };
  prices: {
    id: string;
    name: string;
    amountCents: number;
    isActive: boolean;
  }[];
  _count: { registrations: number };
};

type Props = { course: CourseDetail };

export function CourseDetailHeader({ course }: Props) {
  const spots = course.maxCapacity - course._count.registrations;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          Información del curso
          <CourseStatusBadge status={course.status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Tipo">
            <Badge variant="outline">{course.courseType.name}</Badge>
          </InfoItem>
          <InfoItem label="Fecha">
            {formatCourseDate(course.courseDate)}
          </InfoItem>
          <InfoItem label="Plazas">
            <span className="tabular-nums">
              {course._count.registrations} / {course.maxCapacity}
            </span>
            {spots <= 0 && (
              <Badge variant="destructive" className="ml-2">
                Lleno
              </Badge>
            )}
          </InfoItem>
          <InfoItem label="Precios">
            <PriceList prices={course.prices} />
          </InfoItem>
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Small helpers ──

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium flex items-center">{children}</dd>
    </div>
  );
}

function PriceList({
  prices,
}: {
  prices: CourseDetail["prices"];
}) {
  const active = prices.filter((p) => p.isActive);

  if (active.length === 0) {
    return <span className="text-muted-foreground">Sin precios</span>;
  }

  return (
    <ul className="space-y-0.5">
      {active.map((p) => (
        <li key={p.id} className="tabular-nums">
          {p.name}: {formatPrice(p.amountCents)}
        </li>
      ))}
    </ul>
  );
}
