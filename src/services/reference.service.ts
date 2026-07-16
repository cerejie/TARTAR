import { supabase, toError } from './supabase'
import type { Branch, FarmSection } from '../models'

/** Reference/master data (branches, farm sections). Rarely changes — cached in a store. */

export async function listBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('slug, name, sort')
    .order('sort', { ascending: true })
  if (error) throw toError(error)
  return (data ?? []) as Branch[]
}

export async function listFarmSections(): Promise<FarmSection[]> {
  const { data, error } = await supabase
    .from('farm_sections')
    .select('slug, name')
    .order('name', { ascending: true })
  if (error) throw toError(error)
  return (data ?? []) as FarmSection[]
}
