"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface Task {
  id: string;
  model_id: string;
  prompt: string;
  status: string;
  output_url: string | null;
  created_at: string;
  metadata?: {
    provider?: string;
    provider_task_id?: string;
  };
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/generate");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchTasks(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTasks]);

  // Poll processing tasks
  useEffect(() => {
    const processingTasks = tasks.filter(t => t.status === "processing");

    if (processingTasks.length > 0) {
      pollRef.current = setInterval(async () => {
        for (const task of processingTasks) {
          try {
            const res = await fetch(`/api/generate/${task.id}`);
            const data = await res.json();
            if (data.task && data.task.status !== task.status) {
              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...data.task } : t));
            }
          } catch {
            // ignore
          }
        }
      }, 5000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "videos") return task.model_id !== "gpt-image-2";
    if (activeFilter === "images") return task.model_id === "gpt-image-2";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/15 text-green-400";
      case "processing": return "bg-violet-500/15 text-violet-400";
      case "failed": return "bg-red-500/15 text-red-400";
      default: return "bg-neutral-500/15 text-neutral-400";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <section className="pt-24 pb-6 px-4 border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Recent Creations</h1>
              <p className="text-neutral-400">Your AI-generated videos and images</p>
            </div>
            <div className="flex gap-1 bg-neutral-900/60 border border-neutral-800/50 p-1 rounded-xl">
              {["all", "videos", "images"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                    activeFilter === filter
                      ? "bg-violet-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <p className="text-neutral-400 mb-2">No creations yet</p>
            <p className="text-neutral-600 text-sm">Start generating videos and images to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all"
              >
                <div className="aspect-video bg-neutral-950/80 relative">
                  {task.output_url ? (
                    task.model_id === "gpt-image-2" ? (
                      <Image
                        src={task.output_url}
                        alt={task.prompt}
                        width={640}
                        height={360}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={task.output_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {task.status === "processing" ? (
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-neutral-500">Processing...</p>
                        </div>
                      ) : task.status === "failed" ? (
                        <svg className="w-12 h-12 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-12 h-12 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  )}
                  {/* Hover overlay */}
                  {task.output_url && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={task.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white rounded-full hover:bg-neutral-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-white truncate">{task.prompt.slice(0, 50)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-neutral-500">{task.model_id}</span>
                    <span className="text-neutral-600">?</span>
                    <span className="text-xs text-neutral-500">{formatDate(task.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
