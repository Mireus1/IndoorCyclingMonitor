import os

import uvicorn
from api import app


def main():
    port = int(os.environ.get("APP_PORT", "8000"))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")

if __name__ == "__main__":
    main()
