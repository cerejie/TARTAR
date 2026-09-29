export interface IBank {
  id: string;
  name: string;
  created_at: string;
}

export interface IBankAccount {
  id: string;
  bank_id: string;
  account_name: string;
  account_number: string;
  sort: number;
  active: boolean;
  created_at: string;
  bank?: { name: string } | null;
}
