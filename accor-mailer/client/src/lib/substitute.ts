import type { FieldMapping } from "@shared/types";

export function substituteVariables(
  template: string,
  contact: Record<string, string>,
  mapping: FieldMapping
): string {
  let result = template;

  const email = mapping.emailField ? contact[mapping.emailField] ?? "" : "";
  const firstName = mapping.firstNameField ? contact[mapping.firstNameField] ?? "" : "";
  const lastName = mapping.lastNameField ? contact[mapping.lastNameField] ?? "" : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

  result = result
    .replace(/\{\{email\}\}/gi, email)
    .replace(/\{\{firstName\}\}/gi, firstName)
    .replace(/\{\{first_name\}\}/gi, firstName)
    .replace(/\{\{lastName\}\}/gi, lastName)
    .replace(/\{\{last_name\}\}/gi, lastName)
    .replace(/\{\{name\}\}/gi, fullName)
    .replace(/\{\{fullName\}\}/gi, fullName)
    .replace(/\{\{full_name\}\}/gi, fullName);

  for (const [key, value] of Object.entries(contact)) {
    const safe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`\\{\\{${safe}\\}\\}`, "gi"), value);
  }

  return result;
}
