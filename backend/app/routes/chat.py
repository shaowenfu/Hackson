# -*- coding: utf-8 -*-
"""
聊天相关路由模块
- 提供AI聊天、聊天历史等接口
"""

from flask import Blueprint, request, jsonify

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/message", methods=["POST"])
def chat_message():
    """
    AI聊天接口
    TODO: 实现与OpenAI Azure API的对接，调用chat_service处理业务
    """
    # data = request.json
    # TODO: 调用chat_service.process_message(data)
    return jsonify({"message": "AI聊天接口，待实现"}), 501

@chat_bp.route("/history", methods=["GET"])
def chat_history():
    """
    获取聊天历史接口
    TODO: 实现从MongoDB获取聊天历史，调用chat_service处理业务
    """
    # user_id = request.args.get("user_id")
    # TODO: 调用chat_service.get_history(user_id)
    return jsonify({"message": "聊天历史接口，待实现"}), 501

# TODO: 可根据需求添加更多聊天相关接口，如多模态对话、模式切换等
