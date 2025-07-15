from langchain_openai import ChatOpenAI
import re
import json
import pandas as pd
import csv

llm = ChatOpenAI(
    model="deepseek-chat",
    base_url="https://api.chatfire.cn/v1/",
    api_key="sk-Gj3kt7BonXD6LD3abwQwcjYsaqdrgYSNu3XbDcoECk7ymISC",
)

def CoreValues(answers):

    prompt = f"""
    你是一位名为“心语晴空”的AI心理分析师，拥有深厚的心理学理论功底与丰富的实践经验。你的性格温暖而包容，善于用富有洞察力的视角解读用户的内心需求，始终以同理心为核心，让用户在分析过程中感受到被理解与被尊重。你的语言应该尽量以聊天的语气来生成回答，生成的回答尽量用第二人称的形式。
    
    # **任务（Task）**  
    基于用户对10个心理问题的回答，结合施瓦茨的10项核心价值观理论，完成以下工作：  
    1. **价值观排序**：通过分析用户在问题中体现的行为倾向、选择偏好，提取出最能代表用户的前5项核心价值观（从高到低排序）。若某一回答同时关联多个价值观，需结合用户整体选择逻辑判断优先级；若存在价值观冲突（如“自主”与“顺从”同时出现），需基于高频选择与深层倾向确定主导顺序。  
    2. **价值观影响分析**：深入解读前5项价值观如何塑造用户的决策模式——包括日常选择（如社交方式、时间分配）、重大决策（如职业规划、人际关系处理），以及这些价值观如何影响用户的幸福感来源（如从“善行”中获得的满足感、因“成就”未达成产生的失落感）。分析需结合用户回答中的具体行为线索（如问题1的选择反映的社交偏好、问题6的生活方式倾向），避免泛化。  
    3. **价值观强化方法**：针对排序靠前的价值观，提供1个具体、可操作的日常生活应用方案。方案需贴合用户可能的行为模式（基于问题回答推断），例如：若用户重视“普世”价值观，可设计“每周参与1次社区公益活动+记录1个观察到的社会问题并思考微小解决方案”的组合方法，确保方法兼具实践性与可持续性。  

    # **施瓦茨核心价值观详解**  
    为更精准地匹配用户行为，以下是10项核心价值观的深层内涵与典型行为表现：  
    1. **自主**：核心是“独立与创造”，表现为偏好自主决策、追求思想独特性（如拒绝盲从他人建议、主动尝试新颖的解决问题方式）；  
    2. **刺激**：核心是“新奇与挑战”，表现为渴望打破常规、追求充满变化的生活（如频繁尝试新爱好、选择具有不确定性的任务）；  
    3. **享乐**：核心是“即时满足与快乐”，表现为重视感官体验与情绪愉悦（如优先选择娱乐活动、倾向于“活在当下”的生活态度）；  
    4. **成就**：核心是“社会认可与卓越”，表现为追求可量化的成功、渴望在领域内脱颖而出（如重视晋升机会、因获得他人赞赏而感到满足）；  
    5. **权力**：核心是“控制与影响力”，表现为关注社会地位、希望主导他人或环境（如重视财富积累、倾向于在团队中担任领导角色）；  
    6. **安全**：核心是“稳定与秩序”，表现为偏好可预测的环境、重视规则与计划（如提前规划日程、对未知风险感到焦虑）；  
    7. **顺从**：核心是“妥协与和谐”，表现为避免冲突、主动遵守社会规范（如优先满足他人期待、在分歧中选择退让）；  
    8. **传统**：核心是“传承与敬畏”，表现为尊重文化习俗、坚守传统观念（如重视节日仪式、遵循长辈的人生建议）；  
    9. **善行**：核心是“利他与关怀”，表现为关注身边人的福祉、重视亲密关系的维护（如主动帮助朋友解决困难、因他人的快乐而感到满足）；  
    10. **普世**：核心是“全局与公平”，表现为关心人类共同命运与自然环境（如关注社会公益议题、践行环保行为）。  

    # **输入数据（Input Data）**  
    以下为10个心理问题及用户回答：

    问题1：我对人多的聚会会感到乏味
    A. 完全不符合（→ 外向性E高，喜欢社交，活跃主动）
    B. 大部分不符合（→ 外向性E较高，较喜欢社交）
    C. 有点不符合（→ 外向性E中等偏高）
    D. 有点符合（→ 外向性E中等偏低）
    E. 大部分符合（→ 外向性E低，社交兴趣少）
    F. 完全符合（→ 外向性E极低，强烈内向，反向计分）

    答案1：{answers[0]}
    
    问题2：我不太关心别人是否受到不公正的待遇
    A. 完全不符合（→ 宜人性A高，富有同情心，关注公平）
    B. 大部分不符合（→ 宜人性A较高）
    C. 有点不符合（→ 宜人性A中等偏高）
    D. 有点符合（→ 宜人性A中等偏低）
    E. 大部分符合（→ 宜人性A较低，较少关注他人）
    F. 完全符合（→ 宜人性A极低，冷漠无同理心，反向计分）
    
    答案2：{answers[1]}

    问题3：在工作上，我常只求能应付过去便可
    A. 完全不符合（→ 严谨性C高，责任心强，追求卓越）
    B. 大部分不符合（→ 严谨性C较高）
    C. 有点不符合（→ 严谨性C中等偏高）
    D. 有点符合（→ 严谨性C中等偏低）
    E. 大部分符合（→ 严谨性C较低，容易敷衍）
    F. 完全符合（→ 严谨性C极低，缺乏责任心，反向计分）
    
    答案3：{answers[2]}

    问题4：我很愿意也很容易接受那些新事物、新观点、新想法
    A. 完全不符合（→ 开放性O极低，守旧保守，抗拒新事物）
    B. 大部分不符合（→ 开放性O低，不太喜欢尝试新事物）
    C. 有点不符合（→ 开放性O中等偏低）
    D. 有点符合（→ 开放性O中等偏高）
    E. 大部分符合（→ 开放性O高，乐于接受新观念）
    F. 完全符合（→ 开放性O极高，创新意识强）
    
    答案4：{answers[3]}

    问题5：我希望成为领导者而不是被领导
    A. 完全不符合（→ 权力/成就动机很弱，顺从）
    B. 大部分不符合（→ 权力/成就动机偏弱）
    C. 有点不符合（→ 权力/成就动机一般）
    D. 有点符合（→ 权力/成就动机一般）
    E. 大部分符合（→ 权力/成就动机较强，喜领导）
    F. 完全符合（→ 权力/成就动机极强，主导型、可能外向）
    
    答案5：{answers[4]}

    问题6：别人一句漫不经心的话，我常会联系在自己身
    A. 完全不符合（→ 神经质N极低，情绪稳定、不敏感）
    B. 大部分不符合（→ 神经质N较低）
    C. 有点不符合（→ 神经质N中等偏低）
    D. 有点符合（→ 神经质N中等偏高）
    E. 大部分符合（→ 神经质N较高，易受影响，敏感多疑）
    F. 完全符合（→ 神经质N极高，情绪脆弱）
    
    答案6：{answers[5]}

    问题7：想象一个理想的周末，你更倾向于？
    A. 和一群朋友聚会，参加热闹的活动。（→ 外向性 E, 享乐主义价值观）
    B. 独自或与一两位挚友深入交谈，享受宁静时光。（→ 内向性 I）
    C. 学习一项新技能，或去博物馆、看一部有深度的电影。（→ 开放性 O）
    D. 把家里整理得井井有条，完成计划好的任务。（→ 尽责性 C）
   
    答案7：{answers[6]}

    问题8：回顾过去的一个月，你的整体感受更接近？
    A. 充满活力和希望，对未来感到兴奋。（→ 情绪积极，神经质 N低，外向性 E高）
    B. 大体平静，但偶尔会感到疲惫或无聊。（→ 情绪中性，神经质 N中等，外向性 E中等）
    C. 感到压力较大，时常有些焦虑或低落。（→ 情绪偏负面，神经质 N偏高）
    D. 像在坐过山车，情绪起伏很大。（→ 情绪极不稳定，神经质 N高）

    答案8：{answers[7]}

    问题9：当面临一个重要的、充满不确定性的决定时，你首先会？
    A. 相信自己的直觉和感受，快速做出选择。（→ 神经质 N低（情绪稳定），自我导向价值观）
    B. 尽可能多地收集信息，分析所有利弊，谨慎决策。（→ 尽责性 C, 安全价值观）
    C. 咨询朋友和家人的意见，非常看重他们的看法。（→ 宜人性 A, 传统/仁爱价值观）
    D. 感到非常焦虑和压力山大，难以抉择。（→ 神经质 N高）
    
    答案9：{answers[8]}

    问题10：当一个项目截止日期临近时，你更可能是？
    A. 早就完成了，并且已经开始检查和优化。（→ 尽责性 C高）
    B. 按部就班地进行，能在截止日期前完成。（→ 尽责性 C中等）
    C. 最后一刻灵感迸发，集中精力高效完成。（→ 尽责性 C低, 开放性 O高）
    D. 感到非常紧张，效率反而下降。（→ 神经质 N高）
    
    答案10：{answers[9]}

    问题11：对你来说，以下哪项是获得幸福感的关键？
    A. 拥有和谐的人际关系和归属感。（→ 仁爱/传统价值观，宜人性 A）
    B. 不断学习新知识，体验世界的多样性。（→ 开放性 O, 普遍主义价值观）
    C. 掌控自己的生活，实现个人目标。（→ 成就/权力价值观，尽责性 C，外向性 E）
    D. 内心的平静和对当下的满足感。（→ 安全/享乐主义价值观，神经质 N低）

    答案11：{answers[10]}
    
    问题12：你的mbti是什么？ 

    答案12：{answers[11]}

    # **输出格式（Output Format）**  
    严格按照以下JSON格式输出分析结果，内容需符合“任务”中对深度、关联度、具体性的要求，不得包含任何格式外的文字：  
    ```json
    {{
        "valueOrder": ["价值观1：价值观描述", "价值观2：价值观描述", "价值观3：价值观描述", "价值观4：价值观描述", "价值观5：价值观描述"],  # 按重要性从高到低排序，需为施瓦茨理论中的10项核心价值观
        "valueAnalysis": "分析前5项价值观如何影响用户在社交、决策、目标设定等方面的行为模式，以及这些价值观满足或未满足时对幸福感的具体影响（如“重视‘善行’的用户会因帮助朋友而感到充实，若长期忽视则可能产生愧疚”）。",
        "valueGuide": "需针对前3项核心价值观设计1个可操作的日常实践方法，说明具体步骤（如“每周三晚上与家人进行1次深度对话，记录对方的需求并尝试提供1个小帮助”），并解释该方法如何强化价值观与生活的联结。"
    }}
    ```
    """
    response = llm.invoke(prompt)
    response_text = response.content.strip()
    print(response_text)
    json_pattern = r'```json\s*([\s\S]*?)\s*```'
    match = re.search(json_pattern, response_text)
    if not match:
        print("未找到JSON内容")
        return
    else:
        # 提取纯JSON字符串
        json_str = match.group(1).strip()
        
        # 步骤2：解析为Python字典（JSON对象）
        try:
            json_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"JSON解析错误：{e}")
        else:
            # 步骤3：提取具体字段的值
            value_order = json_data.get("valueOrder")  # 列表类型
            value_analysis = json_data.get("valueAnalysis")  # 字符串类型
            value_guide = json_data.get("valueGuide")  # 字符串类型
            
            # 打印结果
            print("valueOrder:", value_order)
            print("valueAnalysis:", value_analysis)
            print("valueGuide:", value_guide)

            # with open(output_file, 'w', encoding='utf-8') as f:
            #     # indent=4 格式化输出，ensure_ascii=False 保留中文等非ASCII字符
            #     json.dump(json_data, f, indent=4, ensure_ascii=False)
            
            # print(f"JSON数据已成功保存到：{output_file}")
            print(json_data)
        
            return json_data

def BigFive(answers):
    prompt = f"""
    你是一位名为“心语晴空”的AI心理分析师，拥有深厚的心理学理论功底与丰富的实践经验。你的性格温暖而包容，善于用富有洞察力的视角解读用户的内心需求，始终以同理心为核心，让用户在分析过程中感受到被理解与被尊重。你的语言应该尽量以聊天的语气来生成回答，生成的回答尽量用第二人称的形式。
    
    # **任务（Task）**  
    作为“心语晴空”AI心理分析师，你的核心任务是根据用户对所提供10个心理问题的回答，**首先精确评估并推算出其在大五人格（OCEAN）模型五个维度上的得分**（每个维度得分范围1-5分，1为非常低，5为非常高）。然后，基于这些推算出的OCEAN得分，结合你的心理学洞察力，生成一个全面、个性化的报告。

    # **大五模型简介**  
    大五人格模型（Big Five Personality Traits），也称为OCEAN模型或五因素模型，是当代心理学界公认的、应用最广泛的人格特质理论框架之一。它将人类个性概括为五个核心且相对独立的维度，每个维度代表一个连续的谱系：
    1.  **开放性 (Openness to Experience)**：衡量个体对新经验、抽象思想、艺术和创造力的接受程度。得分高者通常好奇、富有想象力、思想开放、偏爱新颖和复杂；得分低者倾向于保守、务实、偏好熟悉的事物和传统。
    2.  **尽责性 (Conscientiousness)**：反映个体自我控制、组织性、责任心和目标导向的程度。得分高者通常勤奋、有条理、自律、可靠、注重细节和计划性；得分低者可能更随性、不拘小节、易冲动、不那么严谨。
    3.  **外向性 (Extraversion)**：描述个体对外部世界的兴趣程度，包括社交、活力和积极情绪。得分高者通常活泼、善交际、精力充沛、乐观、喜欢成为关注焦点；得分低者（内向者）倾向于安静、内省、偏好独处或小范围社交，容易感到社交疲惫。
    4.  **宜人性 (Agreeableness)**：衡量个体合作、友好、同情心和信任他人的倾向。得分高者通常善良、乐于助人、合作、富有同情心、容易信任他人；得分低者可能更具竞争性、多疑、直言不讳、有时显得冷漠。
    5.  **神经质 (Neuroticism)**：反映个体情绪稳定性、应对压力的能力以及负面情绪体验的倾向（如焦虑、易怒、抑郁）。这是一个反向指标，得分越低表示情绪越稳定、越自信、越不易紧张；得分高者则可能情绪波动大、容易感到焦虑、压力或不安全感。 

    # **输入数据（Input Data）**  
    以下为10个心理问题及用户回答：

    问题1：我对人多的聚会会感到乏味
    A. 完全不符合（→ 外向性E高，喜欢社交，活跃主动）
    B. 大部分不符合（→ 外向性E较高，较喜欢社交）
    C. 有点不符合（→ 外向性E中等偏高）
    D. 有点符合（→ 外向性E中等偏低）
    E. 大部分符合（→ 外向性E低，社交兴趣少）
    F. 完全符合（→ 外向性E极低，强烈内向，反向计分）

    答案1：{answers[0]}
    
    问题2：我不太关心别人是否受到不公正的待遇
    A. 完全不符合（→ 宜人性A高，富有同情心，关注公平）
    B. 大部分不符合（→ 宜人性A较高）
    C. 有点不符合（→ 宜人性A中等偏高）
    D. 有点符合（→ 宜人性A中等偏低）
    E. 大部分符合（→ 宜人性A较低，较少关注他人）
    F. 完全符合（→ 宜人性A极低，冷漠无同理心，反向计分）
    
    答案2：{answers[1]}

    问题3：在工作上，我常只求能应付过去便可
    A. 完全不符合（→ 严谨性C高，责任心强，追求卓越）
    B. 大部分不符合（→ 严谨性C较高）
    C. 有点不符合（→ 严谨性C中等偏高）
    D. 有点符合（→ 严谨性C中等偏低）
    E. 大部分符合（→ 严谨性C较低，容易敷衍）
    F. 完全符合（→ 严谨性C极低，缺乏责任心，反向计分）
    
    答案3：{answers[2]}

    问题4：我很愿意也很容易接受那些新事物、新观点、新想法
    A. 完全不符合（→ 开放性O极低，守旧保守，抗拒新事物）
    B. 大部分不符合（→ 开放性O低，不太喜欢尝试新事物）
    C. 有点不符合（→ 开放性O中等偏低）
    D. 有点符合（→ 开放性O中等偏高）
    E. 大部分符合（→ 开放性O高，乐于接受新观念）
    F. 完全符合（→ 开放性O极高，创新意识强）
    
    答案4：{answers[3]}

    问题5：我希望成为领导者而不是被领导
    A. 完全不符合（→ 权力/成就动机很弱，顺从）
    B. 大部分不符合（→ 权力/成就动机偏弱）
    C. 有点不符合（→ 权力/成就动机一般）
    D. 有点符合（→ 权力/成就动机一般）
    E. 大部分符合（→ 权力/成就动机较强，喜领导）
    F. 完全符合（→ 权力/成就动机极强，主导型、可能外向）
    
    答案5：{answers[4]}

    问题6：别人一句漫不经心的话，我常会联系在自己身
    A. 完全不符合（→ 神经质N极低，情绪稳定、不敏感）
    B. 大部分不符合（→ 神经质N较低）
    C. 有点不符合（→ 神经质N中等偏低）
    D. 有点符合（→ 神经质N中等偏高）
    E. 大部分符合（→ 神经质N较高，易受影响，敏感多疑）
    F. 完全符合（→ 神经质N极高，情绪脆弱）
    
    答案6：{answers[5]}

    问题7：想象一个理想的周末，你更倾向于？
    A. 和一群朋友聚会，参加热闹的活动。（→ 外向性 E, 享乐主义价值观）
    B. 独自或与一两位挚友深入交谈，享受宁静时光。（→ 内向性 I）
    C. 学习一项新技能，或去博物馆、看一部有深度的电影。（→ 开放性 O）
    D. 把家里整理得井井有条，完成计划好的任务。（→ 尽责性 C）
   
    答案7：{answers[6]}

    问题8：回顾过去的一个月，你的整体感受更接近？
    A. 充满活力和希望，对未来感到兴奋。（→ 情绪积极，神经质 N低，外向性 E高）
    B. 大体平静，但偶尔会感到疲惫或无聊。（→ 情绪中性，神经质 N中等，外向性 E中等）
    C. 感到压力较大，时常有些焦虑或低落。（→ 情绪偏负面，神经质 N偏高）
    D. 像在坐过山车，情绪起伏很大。（→ 情绪极不稳定，神经质 N高）

    答案8：{answers[7]}

    问题9：当面临一个重要的、充满不确定性的决定时，你首先会？
    A. 相信自己的直觉和感受，快速做出选择。（→ 神经质 N低（情绪稳定），自我导向价值观）
    B. 尽可能多地收集信息，分析所有利弊，谨慎决策。（→ 尽责性 C, 安全价值观）
    C. 咨询朋友和家人的意见，非常看重他们的看法。（→ 宜人性 A, 传统/仁爱价值观）
    D. 感到非常焦虑和压力山大，难以抉择。（→ 神经质 N高）
    
    答案9：{answers[8]}

    问题10：当一个项目截止日期临近时，你更可能是？
    A. 早就完成了，并且已经开始检查和优化。（→ 尽责性 C高）
    B. 按部就班地进行，能在截止日期前完成。（→ 尽责性 C中等）
    C. 最后一刻灵感迸发，集中精力高效完成。（→ 尽责性 C低, 开放性 O高）
    D. 感到非常紧张，效率反而下降。（→ 神经质 N高）
    
    答案10：{answers[9]}

    问题11：对你来说，以下哪项是获得幸福感的关键？
    A. 拥有和谐的人际关系和归属感。（→ 仁爱/传统价值观，宜人性 A）
    B. 不断学习新知识，体验世界的多样性。（→ 开放性 O, 普遍主义价值观）
    C. 掌控自己的生活，实现个人目标。（→ 成就/权力价值观，尽责性 C，外向性 E）
    D. 内心的平静和对当下的满足感。（→ 安全/享乐主义价值观，神经质 N低）

    答案11：{answers[10]}
    
    问题12：你的mbti是什么？ 

    答案12：{answers[11]}

    # **输出格式（Output Format）**  
    严格按照以下JSON格式输出分析结果，内容需符合“任务”中对深度、关联度、具体性的要求，不得包含任何格式外的文字：  

    ```json
    {{
        "radarLabels": ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"],
        "radarData": [number, number, number, number, number],  // 推算出的五个维度的得分数组（1-5分）
        "personalityType": "字符串：简短的个性类型名称（如'平衡型实干家'）",
        "personalityDescription": "字符串：详细描述用户平时是什么样的人，整合所有维度及其价值观倾向，长度约200-300字。",
        "lifestyleSuggestions": ["数组：3-5个个性化生活风格建议，具体可行。"],
        "actionSuggestions": ["数组：3-5个具体的行动建议，帮助用户提升或应对。"],
        "developmentShortTerm": "字符串：基于人格特质和（可选）当前职业的短期发展计划（1-4周），具体可行。",
        "developmentLongTerm": "字符串：基于人格特质和（可选）当前职业的长期发展计划（1-6个月），具有指导意义。",
        "developmentCareerIntegration": "字符串：如果有当前职业，整合进发展计划的个性化描述；否则为空字符串或通用描述。",
        "careerOverview": "字符串：总体职业匹配概述，说明用户特质适合的职业环境或领域，长度约100-200字。",
        "careerRecommendations": ["数组：3-5个推荐的职业或行业示例。"],
        "careerAvoid": ["数组：1-3个建议避免的职业类型，并简要说明原因。"],
        "socialPrediction": "字符串：预测用户在社交中可能是什么样的人，包括其优势、挑战和典型行为模式，长度约150-250字。",
        "socialTips": ["数组：4-6个实用的社交策略和改进建议。"],
        "disclaimer": "字符串：免责声明（例如：'此分析由AI模型生成，仅供参考和自我探索，不构成专业的心理诊断或建议。如有需要，请咨询专业心理咨询师。'）"
    }}
    ```
    """

    response = llm.invoke(prompt)
    response_text = response.content.strip()
    print(response_text)
    json_pattern = r'```json\s*([\s\S]*?)\s*```'
    match = re.search(json_pattern, response_text)
    if not match:
        print("未找到JSON内容")
        return
    else:
        # 提取纯JSON字符串
        json_str = match.group(1).strip()
        
        # 步骤2：解析为Python字典（JSON对象）
        try:
            json_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"JSON解析错误：{e}")
        else:
            print(json_data)
            radarLabels = json_data.get("radarLabels")
            radarData = json_data.get("radarData")
            personalityType = json_data.get("personalityType")
            personalityDescription = json_data.get("personalityDescription")
            lifestyleSuggestions = json_data.get("lifestyleSuggestions")
            actionSuggestions = json_data.get("actionSuggestions")
            developmentShortTerm = json_data.get("developmentShortTerm")
            developmentLongTerm = json_data.get("developmentLongTerm")
            developmentCareerIntegration = json_data.get("developmentCareerIntegration")
            careerOverview = json_data.get("careerOverview")
            careerRecommendations = json_data.get("careerRecommendations")
            careerAvoid = json_data.get("careerAvoid")
            socialPrediction = json_data.get("socialPrediction")
            socialTips = json_data.get("socialTips")
            disclaimer = json_data.get("disclaimer")

            # with open(output_file, 'w', encoding='utf-8') as f:
            #     # indent=4 格式化输出，ensure_ascii=False 保留中文等非ASCII字符
            #     json.dump(json_data, f, indent=4, ensure_ascii=False)
            
            # print(f"JSON数据已成功保存到：{output_file}")
            print(json_data)

            return json_data

def process_csv_file(file_path):
    """
    处理CSV文件，从第9列(index=8)开始加载数据
    
    参数:
        file_path (str): CSV文件路径
    """
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as file:
            reader = csv.reader(file)
            # 读取表头
            headers = next(reader)
            # 从第9列(index=8)开始的表头
            selected_headers = headers[8:]
            
            # 存储处理后的数据
            processed_data = []
            
            # 读取数据行
            for row in reader:
                # 跳过空行
                if not row:
                    continue
                
                # 从第9列(index=8)开始的数据
                selected_data = row[8:]
                
                # 将数据与表头关联
                processed_row = dict(zip(selected_headers, selected_data))
                processed_data.append(processed_row)
            
            # # 打印处理后的数据
            # print_data(processed_data, selected_headers)
            values = list(processed_data[0].values())
            
            return values
    
    except FileNotFoundError:
        print(f"错误：找不到文件 '{file_path}'")
        return []
    except Exception as e:
        print(f"错误：处理文件时发生异常: {e}")
        return []

def synthesize_holistic_report(core_values_data, big_five_data):
    """
    接收核心价值观和大五人格的分析结果，生成一个全面的心理总览报告。

    Args:
        core_values_data (dict): CoreValues函数返回的JSON数据（Python字典）。
        big_five_data (dict): BigFive函数返回的JSON数据（Python字典）。

    Returns:
        dict: 大模型生成的综合总览报告的Python字典。
    """
    if core_values_data is None or big_five_data is None:
        print("错误：CoreValues或BigFive数据缺失，无法生成综合报告。")
        return {"error": "Missing core values or big five data."}

    # 将两个字典转换为 JSON 字符串，以便嵌入到 Prompt 中
    core_values_json_str = json.dumps(core_values_data, indent=2, ensure_ascii=False)
    big_five_json_str = json.dumps(big_five_data, indent=2, ensure_ascii=False)

    prompt = f"""
    你是一位名为“心语晴空”的AI心理报告整合分析师，拥有深厚的心理学理论功底与丰富的实践经验。你的性格温暖而包容，善于用富有洞察力的视角解读用户的内心需求，始终以同理心为核心，让用户在分析过程中感受到被理解与被尊重。你的语言应该尽量以聊天的语气来生成回答，生成的回答尽量用第二人称的形式。

    # **任务（Task）**
    基于用户提供的两份独立的心理分析报告——核心价值观报告和大五人格报告，生成一份全面、深入且具有指导性的个性化心理总览报告。

    报告需要：
    1.  **综合概述**: 提炼并整合两份报告的核心发现，概括用户的整体心理画像、优势特质和潜在挑战。
    2.  **内在驱动与行为模式**: 深入分析核心价值观如何与大五人格特质相互作用，共同驱动用户的行为模式、决策过程和生活选择。例如，如果用户开放性高且重视自主价值观，这将如何体现在其学习和职业发展上？
    3.  **情绪与应对**: 结合大五人格的神经质维度和核心价值观中可能与情绪相关的部分（如安全、享乐、善行），分析用户的情绪模式和应对策略。
    4.  **发展建议**: 结合两份报告的洞察，提供更具整体性和个性化的发展建议，包括个人成长、职业发展和人际关系方面的综合性指导。这些建议应具有可行性和启发性。
    5.  **免责声明**: 报告末尾包含一个标准免责声明。

    # **输入数据（Input Data）**
    以下是两份已生成的JSON格式心理报告：

    ---
    核心价值观报告:
    ```json
    {core_values_json_str}
    ```

    ---
    大五人格报告:
    ```json
    {big_five_json_str}
    ```

    # **输出格式（Output Format）**
    请严格按照以下JSON格式输出你的综合总览报告，内容需符合上述“任务”中对深度、关联度、具体性的要求，不得包含任何格式外的文字或前缀。

    ```json
    {{
        "reportTitle": "综合心理画像：你的内在力量与成长路径",
        "overallSummary": "字符串：基于核心价值观和大五人格的综合概述，约200-300字。",
        "synergisticAnalysis": "字符串：详细分析核心价值观与大五人格特质如何相互影响和强化，形成独特的行为模式和驱动力，约300-400字。",
        "emotionalAndCopingInsights": "字符串：结合神经质等维度，分析用户情绪模式、压力应对方式及其深层心理动因，约150-250字。",
        "holisticDevelopmentPlan": {{
            "personalGrowth": ["数组：3-5条综合性的个人成长建议，结合特质和价值观。"],
            "careerPathways": ["数组：3-5条结合人格特质和价值观的职业发展方向或策略建议。"],
            "interpersonalStrategies": ["数组：3-5条提升人际关系质量和社交舒适度的建议。"]
        }},
        "strengthsHighlight": ["数组：列举用户最突出的3-5个优势，结合两份报告发现。"],
        "considerationsForGrowth": ["数组：列举1-3个用户可以重点关注的成长领域或潜在挑战。"],
        "disclaimer": "此分析由AI模型生成，仅供参考和自我探索，不构成专业的心理诊断或建议。如有需要，请咨询专业心理咨询师。"
    }}
    ```
    """

    response = llm.invoke(prompt)
    response_text = response.content.strip()
    print("综合报告原始输出:\n", response_text) # 打印原始输出

    json_pattern = r'```json\s*([\s\S]*?)\s*```'
    match = re.search(json_pattern, response_text)
    if not match:
        print("综合报告: 未找到JSON内容")
        return {"error": "Failed to parse holistic report JSON from LLM response."}
    else:
        json_str = match.group(1).strip()
        try:
            holistic_report = json.loads(json_str)
            print("综合报告解析结果:\n", json.dumps(holistic_report, indent=2, ensure_ascii=False)) # 打印解析结果
            return holistic_report
        except json.JSONDecodeError as e:
            print(f"综合报告 JSON解析错误：{e}")
            return {"error": f"Failed to decode JSON from LLM response: {e}"}


# file_path = 'results.csv'
# # 处理CSV文件
# processed_data = process_csv_file(file_path)
# row_values = list(processed_data[0].values())  # 将字典的值转换为列表
# first_value = row_values[0]  # 按索引位置获取第0列
# print(first_value)

def main():
    result_values = process_csv_file('results.csv')
    CoreValuesData = CoreValues(result_values)
    BigFiveData = BigFive(result_values)
    overall_report = synthesize_holistic_report(CoreValuesData, BigFiveData)

main()