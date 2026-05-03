import { Badge } from "@/components/ui/badge";
import { isRegistrationClosed } from "@/helpers/registration-deadline";

type Props = {
  registrationDeadline: Date;
  now?: Date;
};

export function CourseClosedBadge({ registrationDeadline, now }: Props) {
  if (!isRegistrationClosed(registrationDeadline, now)) return null;
  return <Badge variant="secondary">Cerrado</Badge>;
}
