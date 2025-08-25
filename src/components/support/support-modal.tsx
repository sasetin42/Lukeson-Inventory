
'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LifeBuoy, Mail, Phone } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LifeBuoy className="h-6 w-6 text-yellow-500" />
                        Support
                    </DialogTitle>
                    <DialogDescription>
                        Get help and support for your workspace.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p>For any questions, issues, or feedback, please reach out to our support team.</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href="mailto:support@example.com" className="text-primary hover:underline">
                                support@example.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>+1 (800) 555-0199</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Our support team is available Monday to Friday, 9 AM to 5 PM.</p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
