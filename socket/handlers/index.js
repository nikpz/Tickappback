// Centralized registration of all socket handlers
import login from "./login";
import users from "./users";
import tasks from "./tasks";
import forms from "./forms";
import objectives from "./objectives";
import strategies from "./strategies";
import indices from "./indices";
import projects from "./projects";
import boards from "./boards";
import teams from "./teams";
import documents from "./documents";
import learning from "./learning";
import workspaces from "./workspaces";
import customerNeeds from "./customerNeeds";
import notifications from "./notifications";
import companyVision from "./companyVision";
import columns from "./columns";
import generalFeedbacks from "./generalFeedbacks";
import feedbackTags from "./feedbackTags";
import processes from "./processes";
import submissions from "./formSubmissions";
import microLearnings from "./microLearnings";

export default function registerHandlers(socket) {
  login(socket);
  users(socket);
  tasks(socket);
  forms(socket);
  objectives(socket);
  strategies(socket);
  indices(socket);
  projects(socket);
  boards(socket);
  teams(socket);
  documents(socket);
  learning(socket);
  workspaces(socket);
  customerNeeds(socket);
  notifications(socket);
  companyVision(socket);
  columns(socket);
  generalFeedbacks(socket);
  feedbackTags(socket);
  processes(socket);
  submissions(socket);
  microLearnings(socket);
}
