from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import time
from models.events import ToolExecutionTrace

class AgentTool(ABC):
    name: str
    description: str

    @abstractmethod
    async def run(self, **kwargs) -> Any:
        """Execute the tool action."""
        pass

    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Wrapper that measures execution time and records structured trace."""
        start_time = time.perf_counter()
        try:
            result = await self.run(**kwargs)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            trace = ToolExecutionTrace(
                tool=self.name,
                status="success",
                duration_ms=duration_ms,
                details={"result_summary": str(result)[:120] if result else "None"}
            )
            return {
                "status": "success",
                "result": result,
                "trace": trace
            }
        except Exception as e:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            trace = ToolExecutionTrace(
                tool=self.name,
                status="error",
                duration_ms=duration_ms,
                details={"error": str(e)}
            )
            return {
                "status": "error",
                "error": str(e),
                "trace": trace
            }
