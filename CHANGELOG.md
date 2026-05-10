# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of SOTA Daily
- 6 data sources: GitHub Trending/Releases, ArXiv, HuggingFace, Hacker News, RSS
- Multi-model AI support: Ollama (local), DeepSeek, Gemini, Qwen, Zhipu
- Cross-source deduplication with Jaccard similarity
- Email push via QQ SMTP
- Full-text search and Markdown export
- Nord dark theme UI
- API authentication and rate limiting
- Docker deployment support
- PWA support
- Comprehensive test setup with Vitest

### Security
- API authentication with Bearer token
- Rate limiting for sensitive endpoints
- Security headers via middleware
- Input validation for all API routes
- Error response sanitization

## [0.1.0] - 2025-01-XX

### Added
- Project initialization
- Basic data fetching and AI summarization
- Email delivery system
- Web UI with Next.js 15
