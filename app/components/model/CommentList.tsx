
import { Comment } from "@/app/lib/modelData";
import { Avatar } from "@/app/components/Avatar";
import { TrashIcon } from "@/app/components/ui/Icons"; 

interface CommentListProps {
  comments: Comment[];
  loading?: boolean;
  currentUserId: number | null;
  onDelete: (commentId: number) => void;
}

export function CommentList({ comments, loading = false, currentUserId, onDelete }: CommentListProps) {
  if (loading) {
    return <div className="p-8 text-center text-xs text-brown/40">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-brown/60 italic bg-brown/5">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-brown/10 max-h-[400px] overflow-y-auto scrollbar-hide">
      {comments.map((comment) => {
        const isCreator = comment.user.role?.toLowerCase() === 'creator';
        const isMyComment = currentUserId === comment.user_id;

        return (
          <div 
            key={comment.id} 
            className={`p-4 flex gap-3 group transition-colors ${
              isCreator ? "bg-brown/10" : "hover:bg-brown/5"
            }`}
          >
             {/* Avatar Section */}
             <div className="shrink-0 pt-1">
               {comment.user?.photo_url ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img
                   src={comment.user.photo_url}
                   alt={comment.user.full_name || "User"}
                   className="size-8 rounded-full object-cover border border-brown/10"
                 />
               ) : (
                 <Avatar name={comment.user?.full_name || "Unknown User"} />
               )}
             </div>
             
             {/* Content Section */}
             <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-2 mb-1">
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-brown truncate">
                      {comment.user?.full_name || "Unknown User"}
                    </p>
                    {isCreator && (
                        <span className="text-[10px] bg-brown text-white px-1.5 py-0.5 rounded font-medium">
                            Creator
                        </span>
                    )}
                 </div>
                 
                 {/* Vertical Stack for Date and Icon */}
                 <div className="flex flex-col items-end gap-1"> 
                    <span className="text-[10px] text-brown/40 whitespace-nowrap">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                    
                    {isMyComment && (
                        <button 
                            onClick={() => onDelete(comment.id)}
                            className="text-brown/40 hover:text-red-500 transition-colors p-0.5" 
                            title="Delete comment"
                        >
                            <TrashIcon /> 
                        </button>
                    )}
                 </div>
               </div>
               <p className="text-sm text-brown/80 break-words leading-relaxed mt-1">
                 {comment.comment_text}
               </p>
             </div>
          </div>
        );
      })}
    </div>
  );
}