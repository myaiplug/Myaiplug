---
name: Phase 2 Performance Report
about: Report performance issues or benchmarks for Phase 2 audio processing
title: "[PERF] "
labels: performance, phase-2
assignees: ''
---

## Model Used
<!-- Which model tier was used? -->
- [ ] Free tier (2-stem model)
- [ ] Pro tier (5-stem model)
- [ ] VIP tier

Model configuration: 

## File Duration
<!-- Duration of the audio file being processed -->
- Duration: 
- File size: 
- Format: 

## Device
<!-- What device was used for processing? -->
- [ ] CPU only
- [ ] GPU

**Device details:**
- CPU: 
- GPU (if applicable): 
- RAM: 
- OS: 

## Benchmarks
<!-- Performance metrics observed -->

| Metric | Value |
|--------|-------|
| Processing time | |
| Memory usage (peak) | |
| GPU utilization | |
| Real-time factor | |

**Processing time breakdown:**
- STFT computation: 
- Model inference: 
- iSTFT reconstruction: 
- Total: 

## Bottlenecks Observed
<!-- What appeared to be the slowest part? -->
- [ ] Audio decoding
- [ ] STFT computation
- [ ] Model inference
- [ ] iSTFT reconstruction
- [ ] Memory allocation
- [ ] File I/O
- [ ] Other: 

**Details:**


## Logs
<!-- Any relevant logs or profiling data -->
```
Paste logs/profiling data here
```

## Expected Performance
<!-- What performance did you expect? -->


## Suggestions for Improvement
<!-- Any ideas on how to improve performance? -->


## Additional Context
<!-- Any other relevant information -->
