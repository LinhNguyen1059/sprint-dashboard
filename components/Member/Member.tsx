import { MembersTable } from "./MembersTable";

export function Member() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Redmine Board</h1>
        <p className="text-muted-foreground">List of your team members</p>
      </div>

      <MembersTable data={[]} />
    </div>
  );
}
