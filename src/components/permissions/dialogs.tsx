"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MappedFile, DrivePermission } from "@/lib/types";
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

// Role colors for badges
const ROLE_COLORS: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    organizer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    fileOrganizer: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    writer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    commenter: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    reader: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

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
    const t = useTranslations();
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
                        {t("dialogs.addPermission.title")}
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
                        <Label htmlFor="type">{t("dialogs.addPermission.permissionType")}</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {t("permissionTypes.user")}
                                    </span>
                                </SelectItem>
                                <SelectItem value="group">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {t("permissionTypes.group")}
                                    </span>
                                </SelectItem>
                                <SelectItem value="domain">
                                    <span className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        {t("permissionTypes.domain")}
                                    </span>
                                </SelectItem>
                                <SelectItem value="anyone">
                                    <span className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        {t("permissionTypes.anyone")}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(type === "user" || type === "group") && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t("dialogs.addPermission.emailAddress")}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("dialogs.addPermission.emailPlaceholder")}
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                    )}

                    {type === "domain" && (
                        <div className="grid gap-2">
                            <Label htmlFor="domain">{t("dialogs.addPermission.domain")}</Label>
                            <Input
                                id="domain"
                                placeholder={t("dialogs.addPermission.domainPlaceholder")}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="role">{t("dialogs.addPermission.role")}</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reader">{t("roles.reader")}</SelectItem>
                                <SelectItem value="commenter">{t("roles.commenter")}</SelectItem>
                                <SelectItem value="writer">{t("roles.writer")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("dialogs.addPermission.submit")}
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
    const t = useTranslations();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (permissionId: string) => {
        setRemovingId(permissionId);
        await onRemove(permissionId);
        setRemovingId(null);
    };

    const permissions = file?.permissions || [];
    const removablePermissions = permissions.filter((p) => p.role !== "owner");

    const getRoleLabel = (role: string) => {
        const roleKey = role as keyof typeof ROLE_COLORS;
        return t(`roles.${roleKey}`) || role;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserMinus className="h-5 w-5" />
                        {t("dialogs.removePermission.title")}
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
                            {t("dialogs.removePermission.noPermissions")}
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
                                                    t("permissionTypes.anyone")}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {permission.emailAddress || permission.domain || permission.type}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={ROLE_COLORS[permission.role] || ""}
                                        >
                                            {getRoleLabel(permission.role)}
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
    const t = useTranslations();
    const permissions = file?.permissions || [];

    const getRoleLabel = (role: string) => {
        const roleKey = role as keyof typeof ROLE_COLORS;
        return t(`roles.${roleKey}`) || role;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t("dialogs.viewPermissions.title")}
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
                            {t("dialogs.viewPermissions.noPermissions")}
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
                                                (permission.type === "anyone" ? t("permissionTypes.anyone") : "Unknown")}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {permission.emailAddress || permission.domain || permission.type}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={ROLE_COLORS[permission.role] || ""}
                                    >
                                        {getRoleLabel(permission.role)}
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
    const t = useTranslations();
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
                        {action === "add" ? t("dialogs.addPermission.bulkTitle") : t("dialogs.removePermission.bulkTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {action === "add"
                            ? t("dialogs.addPermission.bulkDescription", { count: selectedCount })
                            : t("dialogs.removePermission.bulkDescription", { count: selectedCount })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {action === "add" && (
                        <div className="grid gap-2">
                            <Label htmlFor="type">{t("dialogs.addPermission.permissionType")}</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">{t("permissionTypes.user")}</SelectItem>
                                    <SelectItem value="group">{t("permissionTypes.group")}</SelectItem>
                                    <SelectItem value="domain">{t("permissionTypes.domain")}</SelectItem>
                                    <SelectItem value="anyone">{t("permissionTypes.anyone")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(action === "remove" || type === "user" || type === "group") && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t("dialogs.addPermission.emailAddress")}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("dialogs.addPermission.emailPlaceholder")}
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                    )}

                    {action === "add" && type === "domain" && (
                        <div className="grid gap-2">
                            <Label htmlFor="domain">{t("dialogs.addPermission.domain")}</Label>
                            <Input
                                id="domain"
                                placeholder={t("dialogs.addPermission.domainPlaceholder")}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                    )}

                    {action === "add" && (
                        <div className="grid gap-2">
                            <Label htmlFor="role">{t("dialogs.addPermission.role")}</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reader">{t("roles.reader")}</SelectItem>
                                    <SelectItem value="commenter">{t("roles.commenter")}</SelectItem>
                                    <SelectItem value="writer">{t("roles.writer")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        variant={action === "remove" ? "destructive" : "default"}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {action === "add" ? t("dialogs.addPermission.bulkSubmit") : t("dialogs.removePermission.bulkSubmit")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
