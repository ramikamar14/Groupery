"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldBan, ShieldCheck, Trash2, Activity, Crown } from "lucide-react";
import { mockUsers } from "./data";

type User = (typeof mockUsers)[number];

export function UsersTab() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || u.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !u.disabled) ||
      (statusFilter === "disabled" && u.disabled);
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleBan = (id: string) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, disabled: !u.disabled } : u)));

  const toggleRole = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, type: u.type === "organiser" ? "member" : "organiser" } : u
      )
    );

  const deleteUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="organiser">Organiser</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <span className="self-center text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-muted-foreground">No users found</td>
              </tr>
            ) : (
              filtered.map((u: User, i) => (
                <tr key={u.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {u.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-tight">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        u.type === "organiser"
                          ? "border-primary/40 text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }
                    >
                      {u.type === "organiser" && <Crown className="w-3 h-3 mr-1" />}
                      {u.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.verified && (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                          Verified
                        </Badge>
                      )}
                      {u.disabled && (
                        <Badge variant="outline" className="border-red-300 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 text-xs">
                          Banned
                        </Badge>
                      )}
                      {!u.verified && !u.disabled && (
                        <span className="text-xs text-muted-foreground">Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toggleRole(u.id)}>
                        <Crown className="w-3.5 h-3.5" />
                        {u.type === "organiser" ? "→ Member" : "→ Organiser"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 text-xs gap-1 ${u.disabled ? "text-emerald-600 hover:text-emerald-700" : "text-orange-600 hover:text-orange-700"}`}
                        onClick={() => toggleBan(u.id)}
                      >
                        {u.disabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldBan className="w-3.5 h-3.5" />}
                        {u.disabled ? "Unban" : "Ban"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground gap-1">
                        <Activity className="w-3.5 h-3.5" /> Activity
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
