import { loadCodeLists } from "@/services/api";
import { create } from "zustand";

export interface CodeLists {
  roles: string[];
  statuses: string[];
  providers: string[];
  categories: string[];
  fieldTypes: string[];
  idSeqTypes: string[];
}

interface CodeListsState {
  codeLists: CodeLists | null;
  loading: boolean;
  fetchCodeLists: () => Promise<void>;
}

export const useCodeListsStore = create<CodeListsState>((set) => ({
  codeLists: null,
  loading: false,

  fetchCodeLists: async () => {
    set({ loading: true });
    const data = await loadCodeLists();
    set({ codeLists: data, loading: false });
  }
}));
