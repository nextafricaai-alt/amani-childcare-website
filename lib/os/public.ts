// Website → OS bridge. The public website saves enquiries and "bring
// Pikadon to my area" requests straight into the OS (anonymous insert
// only — visitors can never read anything back).
import { supabaseClient } from "./supabase";
import { DemoApi } from "./demo";

// True once NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are set for the build.
export function isLiveSite(): boolean {
  return !!supabaseClient();
}

export interface PublicEnquiry {
  parent_name: string;
  phone: string;
  child_age?: string;
  preferred_date?: string | null;
  message?: string;
  branch_id?: string | null;
}

export async function submitEnquiry(e: PublicEnquiry): Promise<boolean> {
  const row = {
    parent_name: e.parent_name.trim().slice(0, 120),
    phone: e.phone.trim().slice(0, 20),
    child_age: e.child_age?.trim() || null,
    preferred_date: e.preferred_date || null,
    message: e.message?.trim().slice(0, 1000) || null,
    branch_id: e.branch_id || null,
    source: "website",
  };
  const sb = supabaseClient();
  if (!sb) {
    DemoApi.submitPublic("enquiry", row);
    return true;
  }
  const { error } = await sb.from("enquiries").insert(row);
  return !error;
}

export async function submitLocationRequest(area: string, fullName: string, phone: string): Promise<boolean> {
  const row = { area: area.trim().slice(0, 120), full_name: fullName.trim().slice(0, 120), phone: phone.trim().slice(0, 20) || null };
  const sb = supabaseClient();
  if (!sb) {
    DemoApi.submitPublic("location", row);
    return true;
  }
  const { error } = await sb.from("location_requests").insert(row);
  return !error;
}

export interface PublicBranch { id: string; name: string; area: string; status: string }

export async function listPublicBranches(): Promise<PublicBranch[]> {
  const sb = supabaseClient();
  if (!sb) return [];
  const { data } = await sb.from("public_branches").select("id, name, area, status").order("name");
  return (data as PublicBranch[]) ?? [];
}
