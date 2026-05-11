from collections.abc import Callable


class InMemoryJobQueue:
    def __init__(self) -> None:
        self.jobs: dict[str, str] = {}

    def enqueue(self, job_id: str, fn: Callable[[], None]) -> None:
        self.jobs[job_id] = "queued"
        fn()
        self.jobs[job_id] = "completed"


job_queue = InMemoryJobQueue()
