# -*- coding: utf-8 -*-
"""
Azure OpenAI服务接口调用测试示例
演示如何使用OpenAIService类进行各种AI对话和报告生成
"""

import os
import sys
import json
from dotenv import load_dotenv

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 加载环境变量
load_dotenv()

from app.services.openai_service import OpenAIService

def test_basic_chat():
    """
    测试基本聊天功能
    """
    print("\n=== 测试基本聊天功能 ===")
    
    # 初始化服务
    openai_service = OpenAIService()
    
    # 检查可用模型
    available_models = openai_service.get_available_models()
    print(f"可用模型: {available_models}")
    
    if not available_models:
        print("警告: 没有可用的模型，请检查环境变量配置")
        return
    
    # 构造消息
    messages = [
        {"role": "system", "content": "你是一个温暖、有同理心的心理疏导助手，名叫'晴空'。"},
        {"role": "user", "content": "我最近工作压力很大，经常失眠，感觉很焦虑。"}
    ]
    
    # 调用API
    response, tokens = openai_service.chat(messages, model=available_models[0])
    
    if response:
        print(f"AI回复: {response}")
        print(f"使用tokens: {tokens}")
    else:
        print("API调用失败")

def test_single_response():
    """
    测试单次回复功能
    """
    print("\n=== 测试单次回复功能 ===")
    
    openai_service = OpenAIService()
    
    # 使用便捷方法生成单次回复
    response, tokens = openai_service.generate_single_response(
        prompt="请给我一些缓解焦虑的建议",
        system_message="你是专业的心理咨询师，请提供实用的建议。",
        temperature=0.8,
        max_tokens=1000
    )
    
    if response:
        print(f"AI建议: {response}")
        print(f"使用tokens: {tokens}")
    else:
        print("API调用失败")

def test_json_response():
    """
    测试JSON格式回复（用于报告生成）
    """
    print("\n=== 测试JSON格式回复 ===")
    
    openai_service = OpenAIService()
    
    # 构造用于生成心理分析报告的消息
    messages = [
        {
            "role": "system", 
            "content": "你是专业的心理分析师。请根据用户信息生成结构化的心理分析报告，返回JSON格式。"
        },
        {
            "role": "user", 
            "content": """请根据以下信息生成心理分析报告：
            用户信息：25岁，软件工程师，最近工作压力大，经常加班，睡眠质量差，有轻微焦虑症状。
            
            请返回JSON格式，包含以下字段：
            {
                "overview": "总体评估",
                "stress_level": "压力等级(1-10)",
                "recommendations": ["建议1", "建议2", "建议3"],
                "action_plan": "行动计划"
            }"""
        }
    ]
    
    # 调用API，要求返回JSON格式
    response, tokens = openai_service.chat(
        messages, 
        json_response=True,
        temperature=0.7,
        model="4o"  # 指定使用4o模型
    )
    
    if response:
        try:
            # 尝试解析JSON
            report_data = json.loads(response)
            print("生成的心理分析报告:")
            print(json.dumps(report_data, ensure_ascii=False, indent=2))
            print(f"使用tokens: {tokens}")
        except json.JSONDecodeError:
            print(f"JSON解析失败，原始回复: {response}")
    else:
        print("API调用失败")

def test_multi_turn_conversation():
    """
    测试多轮对话
    """
    print("\n=== 测试多轮对话 ===")
    
    openai_service = OpenAIService()
    
    # 模拟多轮对话
    conversation = [
        {"role": "system", "content": "你是心理疏导助手晴空，请进行温暖的对话。"},
        {"role": "user", "content": "我感觉很孤独"}
    ]
    
    # 第一轮对话
    response1, tokens1 = openai_service.chat(conversation)
    if response1:
        print(f"用户: 我感觉很孤独")
        print(f"晴空: {response1}")
        
        # 添加AI回复到对话历史
        conversation.append({"role": "assistant", "content": response1})
        
        # 用户继续对话
        conversation.append({"role": "user", "content": "是的，我确实需要一些朋友，但我不知道怎么交朋友"})
        
        # 第二轮对话
        response2, tokens2 = openai_service.chat(conversation)
        if response2:
            print(f"\n用户: 是的，我确实需要一些朋友，但我不知道怎么交朋友")
            print(f"晴空: {response2}")
            print(f"\n总计使用tokens: {tokens1 + tokens2}")

def test_different_models():
    """
    测试不同模型的效果
    """
    print("\n=== 测试不同模型 ===")
    
    openai_service = OpenAIService()
    available_models = openai_service.get_available_models()
    
    if len(available_models) < 2:
        print("可用模型不足，跳过多模型测试")
        return
    
    prompt = "请用一句话描述什么是心理健康"
    
    for model in available_models[:2]:  # 测试前两个可用模型
        print(f"\n--- 使用模型: {model} ---")
        response, tokens = openai_service.generate_single_response(
            prompt=prompt,
            model=model,
            temperature=0.5
        )
        
        if response:
            print(f"回复: {response}")
            print(f"Tokens: {tokens}")
        else:
            print("调用失败")

def test_error_handling():
    """
    测试错误处理
    """
    print("\n=== 测试错误处理 ===")
    
    openai_service = OpenAIService()
    
    # 测试不支持的模型
    response, tokens = openai_service.chat(
        [{"role": "user", "content": "测试"}],
        model="不存在的模型"
    )
    print(f"不支持模型测试 - 回复: {response}, Tokens: {tokens}")
    
    # 测试空消息
    response, tokens = openai_service.chat([])
    print(f"空消息测试 - 回复: {response}, Tokens: {tokens}")

def main():
    """
    主测试函数
    """
    print("Azure OpenAI服务接口测试开始...")
    
    # 检查环境变量
    required_env_vars = [
        "AZURE_AI_API_KEY_4O",
        "AZURE_AI_ENDPOINT_4O"
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"警告: 缺少环境变量: {missing_vars}")
        print("请确保在.env文件中配置了Azure OpenAI的API密钥和端点")
        return
    
    try:
        # 运行各种测试
        test_basic_chat()
        test_single_response()
        test_json_response()
        test_multi_turn_conversation()
        test_different_models()
        test_error_handling()
        
        print("\n=== 所有测试完成 ===")
        
    except Exception as e:
        print(f"测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()