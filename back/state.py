from typing import Dict, Optional, TYPE_CHECKING

from openant.easy.node import Node

if TYPE_CHECKING:
    from .models import Sensor
    from .sessions import AntSession

node: Optional[Node] = None
last_discovered: Dict[str, "Sensor"] = {}
sessions: Dict[str, "AntSession"] = {}
