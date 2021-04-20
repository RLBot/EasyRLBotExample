# This file is copied from RLBotJS by SuperVK. Some minor changes were made to make it compatible with this codebase.

import os
import socket
import time
import subprocess
import json

from rlbot.agents.base_independent_agent import BaseIndependentAgent
from rlbot.botmanager.helper_process_request import HelperProcessRequest
from rlbot.utils.structures import game_interface


class BaseJavaScriptAgent(BaseIndependentAgent):

    def __init__(self, name, team, index):
        super().__init__(name, team, index)
        self.config = self.read_config_from_file()
        self.port = self.config["port"]
        self.is_retired = False

        self.runner = None
        if self.config["autoStart"]:
            try:
                self.runner = subprocess.Popen(self.config["startCommand"].split(" "), shell=True) 
            except Exception as e:
                self.runner = None
                self.logger.error(f"A JavaScript bot with the name of {self.name} will need to be started manually. Error when running startCommand: {str(e)}.")

    def run_independently(self, terminate_request_event):

        while not terminate_request_event.is_set():
            message = f"add\n{self.index}"

            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.connect(("127.0.0.1", self.port))
                s.send(bytes(message, "ASCII"))
                s.close()
            except ConnectionRefusedError:
                self.logger.warn("Could not connect to server! Searching on port " + str(self.port))

            time.sleep(1)
        else:
            self.retire()

    # def get_helper_process_request(self):
    #     return HelperProcessRequest(python_file_path=None, key=self.name + str(self.port), executable=self.auto_run_path)

    def retire(self):
        port = self.port
        message = f"remove\n{self.index}"

        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect(("127.0.0.1", port))
            s.send(bytes(message, "ASCII"))
            s.close()
        except ConnectionRefusedError:
            self.logger.warn("Could not connect to server!")

        if self.runner is not None:
           self.logger.info(f"Killing auto run process for bot {self.name}...")
           try:
               self.runner.kill()
               self.logger.info("Success!")
           except Exception as e:
               self.logger.error(f"A JavaScript bot with the name of {self.name} will need to be ended manually. **YOU MAY NEED TO RESTART RLBOT.** Error when running trying to kill the bot manager: {str(e)}.")
        else:
           self.logger.error(f"A JavaScript bot with the name of {self.name} will need to be ended manually because it was not auto ran.")

        self.is_retired = True

    def read_config_from_file(self):
        try:
            location = self.get_config_file_path()

            with open(location) as f:
                return json.load(f)

        except ValueError:
            self.logger.warn("Failed to parse config file!")
            raise

    def get_config_file_path(self):
        return os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__), './AgentConfig.json'))
