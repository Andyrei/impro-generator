import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function NotificationBell({ count }: { count: number }) {
  return (
    <Button variant="outline" size="icon" className="relative">
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
        >
          {count}
        </Badge>
      )}
    </Button>
  )
}
