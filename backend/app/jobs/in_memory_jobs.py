from collections.abc import Callable


class InMemoryJobQueue:
    def __init__(self) -> None:
        self.jobs: dict[str, str] = {}

    def enqueue(self, job_id: str, fn: Callable[[], None]) -> None:
        self.jobs[job_id] = "queued"
        try:
            self.jobs[job_id] = "running"
            fn()
            self.jobs[job_id] = "completed"
        except Exception:
            self.jobs[job_id] = "failed"
            raise

    def get_status(self, job_id: str) -> str:
        return self.jobs.get(job_id, "not_found")


job_queue = InMemoryJobQueue()
