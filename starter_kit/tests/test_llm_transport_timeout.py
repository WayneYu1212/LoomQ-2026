import os
import socket
import threading
import time
import unittest
from unittest.mock import patch

from starter_kit.llm_client import chat_completion


class TransportTimeoutTests(unittest.TestCase):
    def test_accepted_connection_without_response_respects_timeout(self):
        server = socket.socket(); server.bind(("127.0.0.1", 0)); server.listen()
        port = server.getsockname()[1]
        def stall():
            connection, _ = server.accept(); time.sleep(5); connection.close(); server.close()
        threading.Thread(target=stall, daemon=True).start()
        env = {"LOOMQ_LLM_BASE_URL": f"http://127.0.0.1:{port}", "LOOMQ_LLM_API_KEY": "local-test", "LOOMQ_LLM_MODEL": "test", "LOOMQ_LLM_TIMEOUT_SECONDS": "1"}
        with patch.dict(os.environ, env, clear=False):
            start = time.monotonic()
            with self.assertRaises(TimeoutError): chat_completion([{"role":"user","content":"x"}])
        self.assertLess(time.monotonic() - start, 4)
