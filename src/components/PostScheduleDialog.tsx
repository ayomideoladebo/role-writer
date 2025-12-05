import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Linkedin, Twitter } from "lucide-react";
import { format } from "date-fns";

interface PostScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  platform: string;
  onSchedule: (scheduledFor: Date) => void;
  isLoading?: boolean;
}

export function PostScheduleDialog({
  open,
  onOpenChange,
  postContent,
  platform,
  onSchedule,
  isLoading,
}: PostScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  const handleSchedule = () => {
    if (!selectedDate) return;
    
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
    onSchedule(scheduledDate);
  };

  const getScheduledDateTime = () => {
    if (!selectedDate) return null;
    const date = new Date(selectedDate);
    date.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
    return date;
  };

  const scheduledDateTime = getScheduledDateTime();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Schedule Post
          </DialogTitle>
          <DialogDescription>
            Choose when you want this post to be published
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Post Preview */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="gap-1">
                {platform === "LinkedIn" ? (
                  <Linkedin className="w-3 h-3" />
                ) : (
                  <Twitter className="w-3 h-3" />
                )}
                {platform}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{postContent}</p>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <div className="flex gap-2">
                <Select value={selectedHour} onValueChange={setSelectedHour}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Selected DateTime Preview */}
          {scheduledDateTime && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Scheduled for</p>
              <p className="font-semibold text-primary">
                {format(scheduledDateTime, "EEEE, MMMM d, yyyy")} at{" "}
                {format(scheduledDateTime, "h:mm a")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!selectedDate || isLoading}
          >
            {isLoading ? "Scheduling..." : "Schedule Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
