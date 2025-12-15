"use client";

import { useState } from "react";
import { MappedFile, DrivePermission } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Folder,
    FileText,
    UserPlus,
    UserMinus,
    Users,
    Mail,
    Globe,
    Trash2,
    Loader2,
} from "lucide-react";

interface AddPermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: MappedFile | null;
    onSubmit: (data: {
        type: string;
        role: string;
        emailAddress?: string;
        domain?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function AddPermissionDialog({
    open,
    onOpenChange,
    file,
    onSubmit,
    isLoading,
}: AddPermissionDialogProps) {
    const [type, setType] = useState<string>("user");
    const [role, setRole] = useState<string>("reader");
    const [emailAddress, setEmailAddress] = useState("");
    const [domain, setDomain] = useState("");

    const handleSubmit = async () => {
        const data: {
            type: string;
            role: string;
            emailAddress?: string;
            domain?: string;
        } = { type, role };

        if (type === "user" || type === "group") {
            data.emailAddress = emailAddress;
        } else if (type === "domain") {
            data.domain = domain;
        }

        await onSubmit(data);

        // Reset form
        setType("user");
        setRole("reader");
        setEmailAddress("");
        setDomain("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add Permission
                    </DialogTitle>
                    <DialogDescription>
                        {file && (
                            <span className="flex items-center gap-2 mt-2">
                                {file.isFolder ? (
                                    <Folder className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-gray-500" />
                                )}
                                {file.name}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Permission Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        User
                                    </span>
                                </SelectItem>
                                <SelectItem value="group">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Group
                                    </span>
                                </SelectItem>
                                <SelectItem value="domain">
                                    <span className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Domain
                                    </span>
                                </SelectItem>
                                <SelectItem value="anyone">
                                    <span className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Anyone with link
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(type === "user" || type === "group") && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                    )}

                    {type === "domain" && (
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                placeholder="example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reader">Viewer</SelectItem>
                                <SelectItem value="commenter">Commenter</SelectItem>
                                <SelectItem value="writer">Editor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Permission
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface RemovePermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: MappedFile | null;
    onRemove: (permissionId: string) => Promise<void>;
    isLoading?: boolean;
}

export function RemovePermissionDialog({
    open,
    onOpenChange,
    file,
    onRemove,
    isLoading,
}: RemovePermissionDialogProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (permissionId: string) => {
        setRemovingId(permissionId);
        await onRemove(permissionId);
        setRemovingId(null);
    };

    const permissions = file?.permissions || [];
    const removablePermissions = permissions.filter((p) => p.role !== "owner");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserMinus className="h-5 w-5" />
                        Remove Permission
                    </DialogTitle>
                    <DialogDescription>
                        {file && (
                            <span className="flex items-center gap-2 mt-2">
                                {file.isFolder ? (
                                    <Folder className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-gray-500" />
                                )}
                                {file.name}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {removablePermissions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No removable permissions. You cannot remove the owner.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {removablePermissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {permission.displayName ||
                                                    permission.emailAddress ||
                                                    permission.domain ||
                                                    "Anyone"}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {permission.emailAddress || permission.domain || permission.type}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={ROLE_COLORS[permission.role] || ""}
                                        >
                                            {ROLE_LABELS[permission.role] || permission.role}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemove(permission.id)}
                                        disabled={isLoading || removingId === permission.id}
                                    >
                                        {removingId === permission.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface ViewPermissionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: MappedFile | null;
}

export function ViewPermissionsDialog({
    open,
    onOpenChange,
    file,
}: ViewPermissionsDialogProps) {
    const permissions = file?.permissions || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Permissions
                    </DialogTitle>
                    <DialogDescription>
                        {file && (
                            <span className="flex items-center gap-2 mt-2">
                                {file.isFolder ? (
                                    <Folder className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-gray-500" />
                                )}
                                {file.name}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {permissions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No permissions found.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {permissions.map((permission, index) => (
                                <div
                                    key={permission.id || index}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {permission.displayName ||
                                                permission.emailAddress ||
                                                permission.domain ||
                                                (permission.type === "anyone" ? "Anyone with link" : "Unknown")}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {permission.emailAddress || permission.domain || permission.type}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={ROLE_COLORS[permission.role] || ""}
                                    >
                                        {ROLE_LABELS[permission.role] || permission.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface BulkActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: "add" | "remove";
    selectedCount: number;
    onSubmit: (data: {
        action: string;
        type?: string;
        role?: string;
        emailAddress?: string;
        domain?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function BulkActionDialog({
    open,
    onOpenChange,
    action,
    selectedCount,
    onSubmit,
    isLoading,
}: BulkActionDialogProps) {
    const [type, setType] = useState<string>("user");
    const [role, setRole] = useState<string>("reader");
    const [emailAddress, setEmailAddress] = useState("");
    const [domain, setDomain] = useState("");

    const handleSubmit = async () => {
        const data: {
            action: string;
            type?: string;
            role?: string;
            emailAddress?: string;
            domain?: string;
        } = { action };

        if (action === "add") {
            data.type = type;
            data.role = role;
            if (type === "user" || type === "group") {
                data.emailAddress = emailAddress;
            } else if (type === "domain") {
                data.domain = domain;
            }
        } else {
            data.emailAddress = emailAddress;
        }

        await onSubmit(data);

        // Reset form
        setType("user");
        setRole("reader");
        setEmailAddress("");
        setDomain("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {action === "add" ? (
                            <UserPlus className="h-5 w-5" />
                        ) : (
                            <UserMinus className="h-5 w-5" />
                        )}
                        {action === "add" ? "Bulk Add Permission" : "Bulk Remove Permission"}
                    </DialogTitle>
                    <DialogDescription>
                        This will {action} permissions for {selectedCount} selected file(s).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {action === "add" && (
                        <div className="grid gap-2">
                            <Label htmlFor="type">Permission Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="group">Group</SelectItem>
                                    <SelectItem value="domain">Domain</SelectItem>
                                    <SelectItem value="anyone">Anyone with link</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(action === "remove" || type === "user" || type === "group") && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                    )}

                    {action === "add" && type === "domain" && (
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                placeholder="example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                    )}

                    {action === "add" && (
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reader">Viewer</SelectItem>
                                    <SelectItem value="commenter">Commenter</SelectItem>
                                    <SelectItem value="writer">Editor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        variant={action === "remove" ? "destructive" : "default"}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {action === "add" ? "Add to Selected" : "Remove from Selected"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
