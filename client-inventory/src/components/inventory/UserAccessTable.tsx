import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { UserAccessList } from '../table/InventoryColumns';
import { searchUsers } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Trash } from 'lucide-react';
import { DataTable } from '../table/DataTable';
import { getColumns } from '../table/UserAccessColumns';
import { useTranslation } from 'react-i18next';

interface UserAccessTableProps {
  initialUsers?: UserAccessList[];
  onChange: (fields: UserAccessList[]) => void;
}

export default function UserAccessTable({
  initialUsers = [],
  onChange,
}: UserAccessTableProps) {
  const { t, i18n } = useTranslation()
  const [users, setUsers] = useState<UserAccessList[]>(initialUsers);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; fullName: string; email: string, avatar: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);


  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await searchUsers(query)
        setSuggestions(res);
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addUser = (user: { id: string; fullName: string; email: string; avatar: string }) => {
    const newList = [
      ...users,
      {
        inventoryId: '',
        userId: user.id,
        user: { fullName: user.fullName, email: user.email, avatar: user.avatar },
      },
    ];
    setUsers(newList);
    onChange(newList);
    setQuery('');
    setShowSuggestions(false);
  };

  const removeSelectedUsers = () => {
    if (selectedIds.length === 0) return;
    const newList = users.filter((u) => !selectedIds.includes(u.userId));
    setUsers(newList);
    onChange(newList);
    setSelectedIds([]);
  };
  const columns = getColumns(t)

  return (
  <div className="space-y-4 w-full">
    <div className="relative w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <Input
          placeholder="Input name or email"
          className="w-full sm:max-w-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={removeSelectedUsers}
          disabled={selectedIds.length === 0}
          className="flex items-center gap-1 w-full sm:w-auto justify-center"
        >
          <Trash />
          Delete
        </Button>
      </div>
      {showSuggestions && query && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full bg-muted border rounded mt-1 shadow max-h-60 overflow-auto"
        >
          {loading ? (
            <li className="px-3 py-2 text-gray-500">Loading...</li>
          ) : suggestions.length > 0 ? (
            suggestions
              .filter((s) => !users.some((u) => u.userId === s.id))
              .map((u) => (
                <li
                  key={u.id}
                  className="px-3 py-2 hover:bg-muted/50 cursor-pointer flex gap-3"
                  onClick={() => addUser(u)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={u.avatar}
                      alt={u.fullName}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                    <AvatarFallback className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">
                      {u.fullName
                        ? u.fullName.charAt(0).toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{u.fullName}</span>
                    <span className="truncate font-light">{u.email}</span>
                  </div>
                </li>
              ))
          ) : (
            <li className="px-3 py-2 text-muted">Users not found</li>
          )}
        </ul>
      )}
    </div>

    <DataTable
      columns={columns}
      data={users}
      showPagination={false}
      getRowId={(row) => row.userId}
      onSelectionChange={setSelectedIds}
    />
  </div>
);

}
