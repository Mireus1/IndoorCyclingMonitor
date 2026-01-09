import threading
import time

from fastapi import HTTPException
from openant.devices import ANTPLUS_NETWORK_KEY
from openant.easy.node import Node
from state import node
from usb_patch import patch_usb_errors

ANT_NETWORK_NUMBER = 0x00


def start_node() -> Node:
    global node
    if node is not None:
        return node

    patch_usb_errors()
    ant_node = Node()
    threading.Thread(target=ant_node.start, daemon=True).start()
    time.sleep(0.2)
    ant_node.set_network_key(ANT_NETWORK_NUMBER, ANTPLUS_NETWORK_KEY)
    node = ant_node
    print("[startup] ANT node started and network key set")
    return ant_node


def require_node() -> Node:
    if node is None:
        raise HTTPException(status_code=500, detail="ANT node not initialized")
    return node
