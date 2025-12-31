import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getProjectById } from "../../projects/action";
import DeleteCard from "./delete-card";
import EditableDetails from "./editable-details";

type Project = NonNullable<Awaited<ReturnType<typeof getProjectById>>>;

export default function TabSections({ project }: { project: Project }) {
  return (
    <Tabs defaultValue="details" asChild>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <EditableDetails initialValues={project} />
      </TabsContent>
      <TabsContent value="settings">
        <DeleteCard id={project.id} />
      </TabsContent>
    </Tabs>
  );
}
